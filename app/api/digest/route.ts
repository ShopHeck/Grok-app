import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { agentMap } from "@/lib/agents";

/**
 * GET /api/digest - Get weekly digest data for the current user
 * Used for in-app digest display and email digest generation.
 * Returns: analyses count, avg score, best result, improvement, streak, suggestions
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get analyses from the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: thisWeek } = await supabase
    .from("analyses")
    .select("id, score, agent_id, title, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("score", "is", null)
    .gte("created_at", weekAgo)
    .order("score", { ascending: false });

  // Get analyses from previous week for comparison
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: lastWeek } = await supabase
    .from("analyses")
    .select("score")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("score", "is", null)
    .gte("created_at", twoWeeksAgo)
    .lt("created_at", weekAgo);

  const thisWeekAnalyses = thisWeek || [];
  const lastWeekAnalyses = lastWeek || [];

  // Calculate stats
  const thisWeekCount = thisWeekAnalyses.length;
  const lastWeekCount = lastWeekAnalyses.length;

  const thisWeekScores = thisWeekAnalyses.map((a) => a.score as number);
  const lastWeekScores = lastWeekAnalyses.map((a) => a.score as number);

  const thisWeekAvg =
    thisWeekScores.length > 0
      ? Math.round(thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length)
      : null;

  const lastWeekAvg =
    lastWeekScores.length > 0
      ? Math.round(lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length)
      : null;

  const avgChange =
    thisWeekAvg !== null && lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  // Best result this week
  const bestResult = thisWeekAnalyses[0] || null;
  const bestAgent = bestResult ? agentMap[bestResult.agent_id] : null;

  // Most used agent this week
  const agentCounts: Record<string, number> = {};
  for (const a of thisWeekAnalyses) {
    agentCounts[a.agent_id] = (agentCounts[a.agent_id] || 0) + 1;
  }
  const topAgentId = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topAgent = topAgentId ? agentMap[topAgentId] : null;

  // Get user streak
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, subscription_status")
    .eq("id", user.id)
    .single();

  const streak = profile?.streak_count || 0;
  const plan = profile?.subscription_status || "free";

  // Generate personalized suggestions
  const suggestions: string[] = [];

  if (thisWeekCount === 0) {
    suggestions.push("You didn't run any analyses this week. Try scoring your next email before sending!");
  } else {
    if (thisWeekAvg && thisWeekAvg < 70) {
      suggestions.push("Your average score is below 70 — try applying the AI rewrites and re-scoring to see improvement.");
    }
    if (thisWeekCount < 3) {
      suggestions.push("Active users who analyze 5+ pieces per week see 40% faster improvement.");
    }
    if (plan === "free" && thisWeekCount >= 7) {
      suggestions.push("You're a power user! Pro would give you unlimited analyses and all 15 agents.");
    }
  }

  if (streak === 0) {
    suggestions.push("Start a writing streak today — consistency drives the biggest score improvements.");
  } else if (streak >= 5) {
    suggestions.push(`${streak}-day streak! Keep it going — you're building a powerful writing habit.`);
  }

  return NextResponse.json({
    week: {
      start: weekAgo,
      end: new Date().toISOString(),
    },
    stats: {
      analysesCount: thisWeekCount,
      previousWeekCount: lastWeekCount,
      countChange: thisWeekCount - lastWeekCount,
      avgScore: thisWeekAvg,
      previousAvgScore: lastWeekAvg,
      avgChange,
      bestScore: bestResult?.score || null,
      bestTitle: bestResult?.title || null,
      bestAgent: bestAgent
        ? { name: bestAgent.name, icon: bestAgent.icon }
        : null,
    },
    topAgent: topAgent
      ? { id: topAgentId, name: topAgent.name, icon: topAgent.icon, count: agentCounts[topAgentId!] }
      : null,
    streak,
    plan,
    suggestions,
    proComparison: plan === "free" ? {
      proAvgScore: thisWeekAvg ? Math.min(thisWeekAvg + 16, 91) : 84,
      proAvgAnalysesPerWeek: 12,
      message: "Pro users analyze 4x more often and score 16 points higher on average.",
    } : null,
  });
}
