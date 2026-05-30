import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/agents/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

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

  // Extension weekly quota (server-side enforcement)
  const weekStart = getWeekStart();
  const { data: extensionUsage } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "extension")
    .gte("created_at", weekStart);

  const extensionWeeklyCount = extensionUsage?.length ?? 0;
  const extensionWeeklyLimit = plan === "free" ? 3 : -1; // -1 = unlimited

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
    extension: {
      weeklyUsed: extensionWeeklyCount,
      weeklyLimit: extensionWeeklyLimit,
      weeklyRemaining: extensionWeeklyLimit > 0
        ? Math.max(0, extensionWeeklyLimit - extensionWeeklyCount)
        : -1,
      weekStart,
    },
  });
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
}
