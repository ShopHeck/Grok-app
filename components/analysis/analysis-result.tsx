"use client";

import { AnalysisResult as AnalysisResultType } from "@/lib/agents/types";
import { AgentConfig } from "@/lib/agents/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "./score-ring";
import { DetailScores } from "./detail-scores";
import { FlagList } from "./flag-list";
import { SuggestionList } from "./suggestion-list";
import { RewriteBlock } from "./rewrite-block";
import { Clock, Zap } from "lucide-react";

interface AnalysisResultProps {
  result: AnalysisResultType;
  agent: AgentConfig;
  title: string;
  createdAt: string;
  tokensUsed?: number;
}

export function AnalysisResult({
  result,
  agent,
  title,
  createdAt,
  tokensUsed,
}: AnalysisResultProps) {
  const criticalFlags = result.flags?.filter((f) => f.severity === "critical") || [];
  const warningFlags = result.flags?.filter((f) => f.severity === "warning") || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="text-xs">
                {agent.name}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {tokensUsed && tokensUsed > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  {tokensUsed.toLocaleString()} tokens
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={result.score} size="lg" label="Overall Score" />
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-lg font-medium">{result.summary}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {criticalFlags.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalFlags.length} critical issue{criticalFlags.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                {warningFlags.length > 0 && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                    {warningFlags.length} warning{warningFlags.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailScores details={result.details} />
          </CardContent>
        </Card>

        {/* Flags / Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Issues Found
              {result.flags && result.flags.length > 0 && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({result.flags.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.flags && result.flags.length > 0 ? (
              <FlagList flags={result.flags} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No issues found. Looking good!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <SuggestionList suggestions={result.suggestions} />
          </CardContent>
        </Card>
      )}

      {/* Rewrite */}
      {result.rewrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Improved Version</CardTitle>
          </CardHeader>
          <CardContent>
            <RewriteBlock rewrite={result.rewrite} label={getRewriteLabel(agent.id)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getRewriteLabel(agentId: string): string {
  switch (agentId) {
    case "cold-email-grader":
      return "Improved Email";
    case "listing-optimizer":
      return "Optimized Listing";
    case "contract-reviewer":
      return "Suggested Counter-Language";
    case "job-post-analyzer":
      return "Rewritten Job Posting";
    default:
      return "Suggested Rewrite";
  }
}
