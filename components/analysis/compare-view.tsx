"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { agentMap } from "@/lib/agents";
import {
  ArrowRight, TrendingUp, TrendingDown, Minus, Share2, Copy, Check,
} from "lucide-react";


interface CompareVersion {
  id: string;
  version: number;
  score: number;
  summary: string;
  inputText: string;
  suggestions: string[];
  rewrite?: string;
  createdAt: string;
}

interface CompareViewVersionsProps {
  versions: CompareVersion[];
  agentId: string;
  title: string;
}

interface AnalysisSnapshot {
  id: string;
  title: string;
  result: { score?: number; summary?: string; suggestions?: string[]; rewrite?: string; details?: Record<string, unknown> };
  createdAt: string;
}

interface CompareViewLegacyProps {
  previous: AnalysisSnapshot;
  current: AnalysisSnapshot;
}

type CompareViewProps = CompareViewVersionsProps | CompareViewLegacyProps;

function isLegacyProps(props: CompareViewProps): props is CompareViewLegacyProps {
  return "previous" in props && "current" in props;
}

/**
 * Before/After comparison showing score improvement, text diff highlights,
 * and a shareable "Score: X → Y" card.
 */
export function CompareView(props: CompareViewProps) {
  // Convert legacy props to versions array
  let versions: CompareVersion[];
  let agentId: string;
  let title: string;

  if (isLegacyProps(props)) {
    versions = [
      {
        id: props.previous.id,
        version: 1,
        score: props.previous.result.score || 0,
        summary: props.previous.result.summary || "",
        inputText: "",
        suggestions: props.previous.result.suggestions || [],
        rewrite: props.previous.result.rewrite,
        createdAt: props.previous.createdAt,
      },
      {
        id: props.current.id,
        version: 2,
        score: props.current.result.score || 0,
        summary: props.current.result.summary || "",
        inputText: "",
        suggestions: props.current.result.suggestions || [],
        rewrite: props.current.result.rewrite,
        createdAt: props.current.createdAt,
      },
    ];
    agentId = "";
    title = props.current.title;
  } else {
    versions = props.versions;
    agentId = props.agentId;
    title = props.title;
  }

  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(versions.length - 1);
  const [showDiff, setShowDiff] = useState(true);
  const [copied, setCopied] = useState(false);

  const agent = agentId ? agentMap[agentId] : null;
  const left = versions[leftIdx];
  const right = versions[rightIdx];

  if (!left || !right) return null;

  const scoreDelta = right.score - left.score;
  const isImproved = scoreDelta > 0;

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-500";
  }

  function getScoreBg(score: number) {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  }

  // Simple word-level diff for highlighting changes
  function computeWordDiff(oldText: string, newText: string) {
    const oldWords = oldText.split(/(\s+)/);
    const newWords = newText.split(/(\s+)/);

    const added: Set<number> = new Set();
    const removed: Set<number> = new Set();

    // Simple LCS-based diff (sufficient for UI highlighting)
    const oldSet = new Set(oldWords);
    const newSet = new Set(newWords);

    newWords.forEach((word, i) => {
      if (!oldSet.has(word) && word.trim()) added.add(i);
    });
    oldWords.forEach((word, i) => {
      if (!newSet.has(word) && word.trim()) removed.add(i);
    });

    return { oldWords, newWords, added, removed };
  }

  const diff = showDiff ? computeWordDiff(left.inputText, right.inputText) : null;

  async function handleShare() {
    const shareText = `${agent?.icon || "🤖"} ${title}\nScore: ${left.score} → ${right.score} (+${scoreDelta})\n\nImproved with AgentDesk (agentdesk.app)`;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Score comparison header */}
      <Card className={cn(
        "border-2",
        isImproved ? "border-emerald-200 bg-emerald-50/30" : "border-border"
      )}>
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Before score */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <div className={cn("text-3xl font-bold tabular-nums", getScoreColor(left.score))}>
                  {left.score}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-0.5">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <Badge
                  variant={isImproved ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    isImproved && "bg-emerald-600"
                  )}
                >
                  {scoreDelta > 0 ? "+" : ""}{scoreDelta}
                </Badge>
              </div>

              {/* After score */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">After</p>
                <div className={cn("text-3xl font-bold tabular-nums", getScoreColor(right.score))}>
                  {right.score}
                </div>
              </div>

              {/* Trend */}
              <div className="ml-4 flex items-center gap-1.5">
                {isImproved ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : scoreDelta < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  isImproved ? "text-emerald-600" : scoreDelta < 0 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {isImproved ? "Improved!" : scoreDelta < 0 ? "Score decreased" : "No change"}
                </span>
              </div>
            </div>

            {/* Share button */}
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version selector */}
      {versions.length > 2 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Compare:</span>
          <select
            value={leftIdx}
            onChange={(e) => setLeftIdx(Number(e.target.value))}
            className="px-2 py-1 border rounded text-xs bg-background"
          >
            {versions.map((v, i) => (
              <option key={v.id} value={i}>v{v.version} (Score: {v.score})</option>
            ))}
          </select>
          <span className="text-muted-foreground">vs</span>
          <select
            value={rightIdx}
            onChange={(e) => setRightIdx(Number(e.target.value))}
            className="px-2 py-1 border rounded text-xs bg-background"
          >
            {versions.map((v, i) => (
              <option key={v.id} value={i}>v{v.version} (Score: {v.score})</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 ml-auto">
            <input
              type="checkbox"
              checked={showDiff}
              onChange={(e) => setShowDiff(e.target.checked)}
              className="rounded"
            />
            <span className="text-muted-foreground">Show changes</span>
          </label>
        </div>
      )}

      {/* Side-by-side text comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left (before) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">v{left.version}</Badge>
              Before
              <span className={cn("ml-auto font-bold", getScoreColor(left.score))}>
                {left.score}/100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-3 bg-muted/50 max-h-64 overflow-y-auto">
              {showDiff && diff ? (
                diff.oldWords.map((word, i) => (
                  <span
                    key={i}
                    className={cn(diff.removed.has(i) && "bg-red-200 line-through text-red-700")}
                  >
                    {word}
                  </span>
                ))
              ) : (
                left.inputText
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right (after) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">v{right.version}</Badge>
              After
              <span className={cn("ml-auto font-bold", getScoreColor(right.score))}>
                {right.score}/100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-3 bg-muted/50 max-h-64 overflow-y-auto">
              {showDiff && diff ? (
                diff.newWords.map((word, i) => (
                  <span
                    key={i}
                    className={cn(diff.added.has(i) && "bg-emerald-200 text-emerald-800")}
                  >
                    {word}
                  </span>
                ))
              ) : (
                right.inputText
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestion comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Issues in v{left.version} ({left.suggestions.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {left.suggestions.slice(0, 3).map((s, i) => (
              <div key={i} className="text-xs p-2 rounded bg-red-50 border border-red-100 text-red-800">
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Remaining in v{right.version} ({right.suggestions.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {right.suggestions.length === 0 ? (
              <div className="text-xs p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-800">
                ✓ No major issues remaining!
              </div>
            ) : (
              right.suggestions.slice(0, 3).map((s, i) => (
                <div key={i} className="text-xs p-2 rounded bg-amber-50 border border-amber-100 text-amber-800">
                  {s}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
