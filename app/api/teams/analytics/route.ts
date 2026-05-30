import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { agentMap } from "@/lib/agents";

/**
 * GET /api/teams/analytics?teamId=xxx - Get team-wide analytics
 * Requires team membership.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Verify membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
  }

  // Get all team member IDs
  const { data: members } = await supabase
    .from("team_members")
    .select("user_id, profile:profiles (display_name, email)")
    .eq("team_id", teamId);

  const memberIds = (members || []).map((m) => m.user_id);
  if (memberIds.length === 0) {
    return NextResponse.json({ analytics: { totalAnalyses: 0, avgScore: 0, scoreChange: 0, topAgents: [], memberStats: [], weeklyTrend: [] } });
  }

  // Get all completed analyses for team members (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, user_id, agent_id, score, created_at")
    .in("user_id", memberIds)
    .eq("status", "completed")
    .not("score", "is", null)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true });

  const allAnalyses = analyses || [];
  const totalAnalyses = allAnalyses.length;
  const scores = allAnalyses.map((a) => a.score as number);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Score change (first half vs second half)
  let scoreChange = 0;
  if (scores.length >= 4) {
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    scoreChange = Math.round(avg2 - avg1);
  }

  // Top agents
  const agentStats: Record<string, { count: number; totalScore: number }> = {};
  for (const a of allAnalyses) {
    if (!agentStats[a.agent_id]) agentStats[a.agent_id] = { count: 0, totalScore: 0 };
    agentStats[a.agent_id].count++;
    agentStats[a.agent_id].totalScore += a.score as number;
  }
  const topAgents = Object.entries(agentStats)
    .map(([agentId, stats]) => ({
      agentId,
      name: agentMap[agentId]?.name || agentId,
      icon: agentMap[agentId]?.icon || "🤖",
      count: stats.count,
      avgScore: Math.round(stats.totalScore / stats.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Member stats
  const memberStatsMap: Record<string, { count: number; totalScore: number }> = {};
  for (const a of allAnalyses) {
    if (!memberStatsMap[a.user_id]) memberStatsMap[a.user_id] = { count: 0, totalScore: 0 };
    memberStatsMap[a.user_id].count++;
    memberStatsMap[a.user_id].totalScore += a.score as number;
  }

  const memberStats = Object.entries(memberStatsMap).map(([userId, stats]) => {
    const member = members?.find((m) => m.user_id === userId);
    const profile = member?.profile as unknown as Record<string, unknown> | null;
    return {
      userId,
      name: (profile?.display_name as string) || (profile?.email as string) || "Unknown",
      count: stats.count,
      avgScore: Math.round(stats.totalScore / stats.count),
    };
  }).sort((a, b) => b.count - a.count);

  // Weekly trend (last 4 weeks)
  const weeklyTrend: { week: string; count: number; avgScore: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(Date.now() - (w + 1) * 7 * 86400000);
    const weekEnd = new Date(Date.now() - w * 7 * 86400000);
    const weekAnalyses = allAnalyses.filter((a) => {
      const d = new Date(a.created_at);
      return d >= weekStart && d < weekEnd;
    });
    const weekScores = weekAnalyses.map((a) => a.score as number);
    weeklyTrend.push({
      week: weekStart.toISOString().split("T")[0],
      count: weekAnalyses.length,
      avgScore: weekScores.length > 0 ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0,
    });
  }

  return NextResponse.json({
    analytics: {
      totalAnalyses,
      avgScore,
      scoreChange,
      topAgents,
      memberStats,
      weeklyTrend,
    },
  });
}
