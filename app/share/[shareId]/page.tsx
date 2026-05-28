import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/components/analysis/analysis-result";
import { agentMap } from "@/lib/agents";
import { Zap } from "lucide-react";
import type { AnalysisResult as AnalysisResultType } from "@/lib/agents/types";
import type { Metadata } from "next";

// Use service role to bypass RLS for public share pages
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const supabase = getPublicClient();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("title, agent_id, score, summary")
    .eq("share_id", shareId)
    .eq("status", "completed")
    .single();

  if (!analysis) {
    return { title: "Analysis Not Found" };
  }

  const agent = agentMap[analysis.agent_id];

  return {
    title: `${analysis.title} — ${agent?.name || "Analysis"} Result`,
    description:
      analysis.summary ||
      `Score: ${analysis.score}/100. Analyzed with ${agent?.name || "AI"}.`,
    openGraph: {
      title: `${agent?.icon || "🤖"} ${analysis.title} — Score: ${analysis.score}/100`,
      description:
        analysis.summary || `AI analysis result from AgentDesk`,
      type: "article",
    },
  };
}

export default async function SharedAnalysisPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const supabase = getPublicClient();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, title, agent_id, status, score, summary, result, created_at, tokens_used")
    .eq("share_id", shareId)
    .eq("status", "completed")
    .single();

  if (!analysis) notFound();

  const agent = agentMap[analysis.agent_id];

  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">AgentDesk</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Shared Result
            </Badge>
            <Link href="/sign-up">
              <Button size="sm">Try Free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl py-8 px-4">
        {analysis.result && agent ? (
          <AnalysisResult
            result={analysis.result as AnalysisResultType}
            agent={agent}
            title={analysis.title}
            createdAt={analysis.created_at}
            tokensUsed={analysis.tokens_used}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{analysis.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This analysis result is not available.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <p className="font-medium mb-1">
              Want to run your own analysis?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              AgentDesk has 5+ AI agents for business writing. Start free.
            </p>
            <Link href="/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
