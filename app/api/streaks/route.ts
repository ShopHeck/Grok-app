import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/streaks - Get user's streak data, score history, and personal bests
 * POST /api/streaks - Record a new day of activity (called after analysis completion)
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get streak data from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, streak_last_date, longest_streak, streak_rewards_claimed")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = profile?.streak_count || 0;
  const lastDate = profile?.streak_last_date || "";

  // Check if streak is still active (last activity was today or yesterday)
  if (lastDate !== today && lastDate !== yesterday) {
    currentStreak = 0; // Streak is broken
  }

  // Get personal bests (top score per agent)
  const { data: personalBests } = await supabase
    .from("analyses")
    .select("agent_id, score, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("score", "is", null)
    .order("score", { ascending: false });

  // Group by agent and get best for each
  const bestByAgent: Record<string, { score: number; date: string }> = {};
  for (const row of personalBests || []) {
    if (!bestByAgent[row.agent_id]) {
      bestByAgent[row.agent_id] = {
        score: row.score as number,
        date: row.created_at,
      };
    }
  }

  // Get score history (last 30 analyses with dates)
  const { data: scoreHistory } = await supabase
    .from("analyses")
    .select("score, created_at, agent_id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("score", "is", null)
    .order("created_at", { ascending: true })
    .limit(50);

  // Calculate average score improvement (first 10 vs last 10)
  const scores = (scoreHistory || []).map((s) => s.score as number);
  let improvement = 0;
  if (scores.length >= 10) {
    const first5 = scores.slice(0, 5);
    const last5 = scores.slice(-5);
    const avgFirst = first5.reduce((a, b) => a + b, 0) / first5.length;
    const avgLast = last5.reduce((a, b) => a + b, 0) / last5.length;
    improvement = Math.round(avgLast - avgFirst);
  }

  // Streak milestones and rewards
  const milestones = [
    { days: 3, reward: "1 bonus analysis", claimed: (profile?.streak_rewards_claimed || []).includes(3) },
    { days: 7, reward: "2 bonus analyses", claimed: (profile?.streak_rewards_claimed || []).includes(7) },
    { days: 14, reward: "Unlock 1 Pro agent for a day", claimed: (profile?.streak_rewards_claimed || []).includes(14) },
    { days: 30, reward: "5 bonus analyses + Pro agent for a week", claimed: (profile?.streak_rewards_claimed || []).includes(30) },
  ];

  return NextResponse.json({
    streak: {
      current: currentStreak,
      longest: profile?.longest_streak || currentStreak,
      lastDate,
      isActiveToday: lastDate === today,
    },
    personalBests: bestByAgent,
    scoreHistory: (scoreHistory || []).map((s) => ({
      score: s.score,
      date: s.created_at,
      agentId: s.agent_id,
    })),
    improvement,
    milestones,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Get current streak data
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, streak_last_date, longest_streak")
    .eq("id", user.id)
    .single();

  const lastDate = profile?.streak_last_date || "";
  let currentStreak = profile?.streak_count || 0;
  let longestStreak = profile?.longest_streak || 0;

  if (lastDate === today) {
    // Already recorded today, return current
    return NextResponse.json({
      streak: currentStreak,
      isNewDay: false,
      personalBest: false,
    });
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (lastDate === yesterday) {
    // Continue streak
    currentStreak += 1;
  } else {
    // Streak broken or first ever
    currentStreak = 1;
  }

  // Check if new longest
  let isNewLongest = false;
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    isNewLongest = true;
  }

  // Update profile
  await supabase
    .from("profiles")
    .update({
      streak_count: currentStreak,
      streak_last_date: today,
      longest_streak: longestStreak,
    })
    .eq("id", user.id);

  // Check if new personal best score was set (from request body)
  let personalBestInfo = null;
  try {
    const body = await request.json();
    if (body.score && body.agentId) {
      const { data: existingBest } = await supabase
        .from("analyses")
        .select("score")
        .eq("user_id", user.id)
        .eq("agent_id", body.agentId)
        .eq("status", "completed")
        .not("score", "is", null)
        .order("score", { ascending: false })
        .limit(1)
        .single();

      if (!existingBest || body.score > (existingBest.score as number)) {
        personalBestInfo = {
          agentId: body.agentId,
          score: body.score,
          previousBest: existingBest?.score || null,
        };
      }
    }
  } catch {
    // No body or invalid body — that's fine
  }

  // Determine milestone reached
  const milestoneReached = [3, 7, 14, 30, 60, 100].find(
    (m) => currentStreak === m
  );

  return NextResponse.json({
    streak: currentStreak,
    longestStreak,
    isNewDay: true,
    isNewLongest,
    milestoneReached: milestoneReached || null,
    personalBest: personalBestInfo,
  });
}
