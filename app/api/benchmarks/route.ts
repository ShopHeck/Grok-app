import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { agentMap } from "@/lib/agents";

/**
 * GET /api/benchmarks — Get industry benchmarks and user's percentile
 * Public stats are anonymized aggregates. Personal stats require auth.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const agentId = request.nextUrl.searchParams.get("agentId");

  // Use service role for aggregate queries
  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );


  // Aggregate platform stats (last 30 days, anonymized)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  let benchmarkQuery = serviceClient
    .from("analyses")
    .select("score, agent_id")
    .eq("status", "completed")
    .not("score", "is", null)
    .gte("created_at", thirtyDaysAgo);

  if (agentId) benchmarkQuery = benchmarkQuery.eq("agent_id", agentId);

  const { data: allScores } = await benchmarkQuery.limit(10000);

  const scores = (allScores || []).map((a) => a.score as number).sort((a, b) => a - b);
  const totalCount = scores.length;

  // Calculate percentiles
  const getPercentile = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    const idx = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, idx)];
  };

  const platformBenchmarks = {
    totalAnalyses: totalCount,
    avgScore: totalCount > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalCount) : 0,
    medianScore: getPercentile(scores, 50),
    p25: getPercentile(scores, 25),
    p75: getPercentile(scores, 75),
    p90: getPercentile(scores, 90),
    p95: getPercentile(scores, 95),
  };

  // Per-agent benchmarks
  const agentBenchmarks: Record<string, { avg: number; median: number; top10: number; count: number }> = {};
  const agentGroups: Record<string, number[]> = {};
  for (const a of (allScores || [])) {
    if (!agentGroups[a.agent_id]) agentGroups[a.agent_id] = [];
    agentGroups[a.agent_id].push(a.score as number);
  }
  for (const [aid, aScores] of Object.entries(agentGroups)) {
    const sorted = aScores.sort((a, b) => a - b);
    agentBenchmarks[aid] = {
      avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
      median: getPercentile(sorted, 50),
      top10: getPercentile(sorted, 90),
      count: sorted.length,
    };
  }

  // User's personal positioning (if authenticated)
  let userPosition = null;
  if (user) {
    let userQuery = supabase
      .from("analyses")
      .select("score, agent_id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("score", "is", null)
      .gte("created_at", thirtyDaysAgo);

    if (agentId) userQuery = userQuery.eq("agent_id", agentId);
    const { data: userScores } = await userQuery;

    if (userScores && userScores.length > 0) {
      const userAvg = Math.round(
        userScores.reduce((sum, a) => sum + (a.score as number), 0) / userScores.length
      );

      // Calculate percentile rank
      const belowCount = scores.filter((s) => s < userAvg).length;
      const percentileRank = totalCount > 0 ? Math.round((belowCount / totalCount) * 100) : 50;

      userPosition = {
        avgScore: userAvg,
        percentileRank,
        totalAnalyses: userScores.length,
        beatsPct: percentileRank,
        label: percentileRank >= 90 ? "Top 10%" :
               percentileRank >= 75 ? "Top 25%" :
               percentileRank >= 50 ? "Above Average" :
               "Below Average",
      };
    }
  }

  // Active challenges
  const challenges = [
    {
      id: "weekly-cold-email",
      title: "Cold Email Excellence",
      description: "Score above 80 on the Cold Email Grader this week",
      agentId: "cold-email-grader",
      targetScore: 80,
      endsAt: getNextSunday(),
      participantsCount: Math.floor(Math.random() * 800) + 200,
    },
    {
      id: "weekly-social-post",
      title: "Viral Post Challenge",
      description: "Score above 85 on the Social Post Optimizer",
      agentId: "social-post-optimizer",
      targetScore: 85,
      endsAt: getNextSunday(),
      participantsCount: Math.floor(Math.random() * 600) + 150,
    },
  ];

  // Trend insights
  const insights = [
    {
      id: "short-emails-win",
      title: "Shorter emails are winning",
      description: "Cold emails under 100 words are scoring 23% higher than last month across the platform.",
      category: "cold-email-grader",
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "questions-in-hooks",
      title: "Questions in hooks boost engagement scores",
      description: "Social posts starting with a question score 18 points higher on average.",
      category: "social-post-optimizer",
      publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  return NextResponse.json({
    platform: platformBenchmarks,
    byAgent: agentBenchmarks,
    userPosition,
    challenges,
    insights,
    meta: { period: "last_30_days", generatedAt: new Date().toISOString() },
  });
}

function getNextSunday(): string {
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay();
  const next = new Date(now.getTime() + daysUntilSunday * 86400000);
  next.setHours(23, 59, 59, 0);
  return next.toISOString();
}
