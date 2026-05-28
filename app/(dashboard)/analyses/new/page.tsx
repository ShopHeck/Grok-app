import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisForm } from "@/components/analysis/analysis-form";
import { PLAN_LIMITS } from "@/lib/agents/types";

export default async function NewAnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get user plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Get current usage
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: usage } = await supabase
    .from("usage")
    .select("analysis_count")
    .eq("user_id", user.id)
    .eq("period_start", periodStart);

  const totalUsed = (usage || []).reduce(
    (sum, row) => sum + (row.analysis_count || 0),
    0
  );

  const remaining =
    limits.maxAnalysesPerMonth > 0
      ? Math.max(0, limits.maxAnalysesPerMonth - totalUsed)
      : -1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Analysis</h1>
        <p className="text-muted-foreground">
          Choose an AI agent and submit your content for analysis
        </p>
      </div>
      <AnalysisForm userPlan={plan} remainingQuota={remaining} />
    </div>
  );
}
