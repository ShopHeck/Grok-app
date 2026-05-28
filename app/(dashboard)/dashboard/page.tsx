import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/analysis/score-ring";
import { agentMap } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import {
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get profile for plan info
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Get recent analyses
  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, title, agent_id, status, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get usage stats
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: usage } = await supabase
    .from("usage")
    .select("analysis_count, tokens_used")
    .eq("user_id", user.id)
    .eq("period_start", periodStart);

  const totalThisMonth = (usage || []).reduce(
    (sum, row) => sum + (row.analysis_count || 0),
    0
  );

  const { count: totalAllTime } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Average score
  const { data: scoreData } = await supabase
    .from("analyses")
    .select("score")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("score", "is", null)
    .limit(20);

  const avgScore =
    scoreData && scoreData.length > 0
      ? Math.round(
          scoreData.reduce((sum, s) => sum + (s.score || 0), 0) / scoreData.length
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your AI toolkit overview
          </p>
        </div>
        <Link href="/analyses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">{totalThisMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {limits.maxAnalysesPerMonth > 0 ? (
                <span>
                  of {limits.maxAnalysesPerMonth} analyses
                </span>
              ) : (
                <span>analyses (unlimited)</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>All Time</CardDescription>
            <CardTitle className="text-3xl">{totalAllTime ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> total analyses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Score</CardDescription>
            <CardTitle className="text-3xl">
              {avgScore !== null ? avgScore : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> across all agents
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan</CardDescription>
            <CardTitle className="text-3xl capitalize">{plan}</CardTitle>
          </CardHeader>
          <CardContent>
            {plan === "free" ? (
              <Link
                href="/settings"
                className="text-sm text-primary hover:underline"
              >
                Upgrade for unlimited
              </Link>
            ) : (
              <div className="text-sm text-muted-foreground">
                All agents unlocked
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your latest results</CardDescription>
            </div>
            <Link href="/analyses">
              <Button variant="outline" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!analyses || analyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No analyses yet</p>
              <p className="text-sm mb-4">
                Choose an AI agent and submit your first analysis
              </p>
              <Link href="/analyses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {analyses.map((analysis) => {
                const agent = agentMap[analysis.agent_id];
                return (
                  <Link
                    key={analysis.id}
                    href={`/analyses/${analysis.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {agent?.icon ?? "✨"}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {analysis.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {agent?.name ?? analysis.agent_id} &middot;{" "}
                          <Clock className="inline h-3 w-3" />{" "}
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {analysis.score !== null && analysis.status === "completed" && (
                        <ScoreRing score={analysis.score} size="sm" />
                      )}
                      <Badge variant={statusVariant(analysis.status)}>
                        {analysis.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
