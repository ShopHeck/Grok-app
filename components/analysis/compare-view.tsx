"use client";

import { AnalysisResult as AnalysisResultType } from "@/lib/agents/types";
import { ScoreRing } from "./score-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CompareViewProps {
  previous: {
    id: string;
    title: string;
    result: AnalysisResultType;
    createdAt: string;
  };
  current: {
    id: string;
    title: string;
    result: AnalysisResultType;
    createdAt: string;
  };
}

export function CompareView({ previous, current }: CompareViewProps) {
  const scoreDelta = current.result.score - previous.result.score;

  return (
    <div className="flex flex-col gap-6">
      {/* Score comparison header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Previous */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground font-medium">Previous</p>
              <ScoreRing score={previous.result.score} size="md" />
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(previous.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Arrow + delta */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <Badge
                variant={scoreDelta > 0 ? "default" : scoreDelta < 0 ? "destructive" : "secondary"}
                className="gap-1"
              >
                {scoreDelta > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : scoreDelta < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {scoreDelta > 0 ? "+" : ""}
                {scoreDelta} pts
              </Badge>
            </div>

            {/* Current */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground font-medium">Current</p>
              <ScoreRing score={current.result.score} size="md" />
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(current.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail comparisons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <CompareDetailScores
            previousDetails={previous.result.details}
            currentDetails={current.result.details}
          />
        </CardContent>
      </Card>

      {/* Summary comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Previous Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{previous.result.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Current Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{current.result.summary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Flag count comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issues Resolved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {previous.result.flags?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Before</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {current.result.flags?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">After</p>
            </div>
            {(previous.result.flags?.length ?? 0) > (current.result.flags?.length ?? 0) && (
              <Badge variant="secondary" className="ml-4">
                {(previous.result.flags?.length ?? 0) - (current.result.flags?.length ?? 0)} issues fixed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareDetailScores({
  previousDetails,
  currentDetails,
}: {
  previousDetails: Record<string, unknown>;
  currentDetails: Record<string, unknown>;
}) {
  // Extract scores from both
  const allKeys = new Set([
    ...Object.keys(previousDetails || {}),
    ...Object.keys(currentDetails || {}),
  ]);

  const comparisons: Array<{
    label: string;
    prev: number | null;
    curr: number | null;
    delta: number;
  }> = [];

  for (const key of allKeys) {
    const prevVal = previousDetails?.[key];
    const currVal = currentDetails?.[key];

    const prevScore =
      prevVal && typeof prevVal === "object" && "score" in (prevVal as Record<string, unknown>)
        ? (prevVal as Record<string, unknown>).score as number
        : null;
    const currScore =
      currVal && typeof currVal === "object" && "score" in (currVal as Record<string, unknown>)
        ? (currVal as Record<string, unknown>).score as number
        : null;

    if (prevScore !== null || currScore !== null) {
      comparisons.push({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        prev: prevScore,
        curr: currScore,
        delta: (currScore ?? 0) - (prevScore ?? 0),
      });
    }
  }

  if (comparisons.length === 0) {
    return <p className="text-sm text-muted-foreground">No comparable categories found.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comparisons.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="text-sm font-medium flex-1">{item.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground tabular-nums w-8 text-right">
              {item.prev ?? "—"}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium tabular-nums w-8">
              {item.curr ?? "—"}
            </span>
            <Badge
              variant={item.delta > 0 ? "default" : item.delta < 0 ? "destructive" : "secondary"}
              className={cn("text-xs w-14 justify-center", item.delta === 0 && "opacity-50")}
            >
              {item.delta > 0 ? "+" : ""}
              {item.delta}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
