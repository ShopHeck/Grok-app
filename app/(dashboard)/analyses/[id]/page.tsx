import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/components/analysis/analysis-result";
import { ShareButton } from "@/components/analysis/share-button";
import { ReanalyzeButton } from "@/components/analysis/reanalyze-button";
import { CompareView } from "@/components/analysis/compare-view";
import { DeleteAnalysisButton } from "@/components/analysis/delete-button";
import { agentMap } from "@/lib/agents";
import { ArrowLeft } from "lucide-react";
import type { AnalysisResult as AnalysisResultType } from "@/lib/agents/types";

export default async function AnalysisDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ compare?: string }>;
}) {
  const { id } = await params;
  const { compare: compareId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) notFound();

  const agent = agentMap[analysis.agent_id];

  // Load comparison data if compare param or parent_id exists
  let compareAnalysis = null;
  const compareTarget = compareId || analysis.parent_id;
  if (compareTarget && analysis.status === "completed") {
    const { data } = await supabase
      .from("analyses")
      .select("id, title, result, created_at, status")
      .eq("id", compareTarget)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();
    compareAnalysis = data;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back navigation + actions */}
      <div className="flex items-center justify-between">
        <Link href="/analyses">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
        {analysis.status === "completed" && (
          <div className="flex items-center gap-2">
            <ReanalyzeButton
              analysisId={analysis.id}
              agentId={analysis.agent_id}
              inputText={analysis.input_text}
              title={analysis.title}
            />
            <ShareButton
              analysisId={analysis.id}
              initialShareId={analysis.share_id}
            />
            <DeleteAnalysisButton analysisId={analysis.id} />
          </div>
        )}
      </div>

      {/* Compare View (if comparing) */}
      {compareAnalysis && analysis.status === "completed" && analysis.result && (
        <CompareView
          previous={{
            id: compareAnalysis.id,
            title: compareAnalysis.title,
            result: compareAnalysis.result as AnalysisResultType,
            createdAt: compareAnalysis.created_at,
          }}
          current={{
            id: analysis.id,
            title: analysis.title,
            result: analysis.result as AnalysisResultType,
            createdAt: analysis.created_at,
          }}
        />
      )}

      {/* Completed - show full results */}
      {analysis.status === "completed" && analysis.result && agent && (
        <AnalysisResult
          result={analysis.result as AnalysisResultType}
          agent={agent}
          title={analysis.title}
          createdAt={analysis.created_at}
          tokensUsed={analysis.tokens_used}
          inputText={analysis.input_text}
        />
      )}

      {/* Completed but no agent config */}
      {analysis.status === "completed" && analysis.result && !agent && (
        <Card>
          <CardHeader>
            <CardTitle>{analysis.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap overflow-auto">
              {JSON.stringify(analysis.result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Failed */}
      {analysis.status === "failed" && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent?.icon ?? "✨"}</span>
              <div>
                <CardTitle>{analysis.title}</CardTitle>
                <Badge variant="destructive" className="mt-1">
                  Failed
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {analysis.error_message ?? "An unknown error occurred"}
            </p>
            <Link href="/analyses/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Try Again
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Processing / Pending */}
      {(analysis.status === "pending" || analysis.status === "processing") && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-medium">Processing your analysis...</p>
            <p className="text-sm mt-1">This usually takes 5-15 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Input text (collapsed) */}
      {analysis.input_text && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Original Input</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground line-clamp-6 font-mono">
              {analysis.input_text}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {analysis.input_text.length.toLocaleString()} characters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
