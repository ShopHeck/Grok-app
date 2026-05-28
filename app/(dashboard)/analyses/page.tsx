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
import { Plus, Sparkles, Clock } from "lucide-react";

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

export default async function AnalysesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, title, agent_id, status, score, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground">
            All your AI-powered analyses in one place
          </p>
        </div>
        <Link href="/analyses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Analysis
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Analyses</CardTitle>
          <CardDescription>
            {analyses?.length ?? 0} total analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analyses || analyses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">No analyses yet</p>
              <p className="text-sm mb-4">
                Start by choosing an AI agent and running your first analysis
              </p>
              <Link href="/analyses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Run Your First Analysis
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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl shrink-0">
                        {agent?.icon ?? "✨"}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">
                          {analysis.title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {agent?.name ?? analysis.agent_id} &middot;{" "}
                          <Clock className="inline h-3 w-3" />{" "}
                          {new Date(analysis.created_at).toLocaleString()}
                        </span>
                        {analysis.summary && (
                          <span className="text-xs text-muted-foreground mt-0.5 truncate">
                            {analysis.summary}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {analysis.score !== null &&
                        analysis.status === "completed" && (
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
