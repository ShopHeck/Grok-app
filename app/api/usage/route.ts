import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/agents/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Get current month usage
  const periodStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const { data: usage } = await supabase
    .from("usage")
    .select("agent_id, analysis_count, tokens_used")
    .eq("user_id", user.id)
    .eq("period_start", periodStart);

  const totalAnalyses = (usage || []).reduce(
    (sum, row) => sum + (row.analysis_count || 0),
    0
  );

  const totalTokens = (usage || []).reduce(
    (sum, row) => sum + (row.tokens_used || 0),
    0
  );

  return NextResponse.json({
    plan,
    limits,
    usage: {
      totalAnalyses,
      totalTokens,
      byAgent: usage || [],
      periodStart,
    },
    remaining:
      limits.maxAnalysesPerMonth > 0
        ? Math.max(0, limits.maxAnalysesPerMonth - totalAnalyses)
        : -1, // -1 = unlimited
  });
}
