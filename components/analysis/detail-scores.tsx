"use client";

import { cn } from "@/lib/utils";

interface DetailScoresProps {
  details: Record<string, unknown>;
}

interface ScoreDetail {
  label: string;
  score: number;
  suggestions?: string[];
}

export function DetailScores({ details }: DetailScoresProps) {
  if (!details || typeof details !== "object") return null;

  // Extract sub-scores from the details object
  const scores: ScoreDetail[] = [];

  for (const [key, value] of Object.entries(details)) {
    if (value && typeof value === "object" && "score" in (value as Record<string, unknown>)) {
      const detail = value as Record<string, unknown>;
      scores.push({
        label: formatLabel(key),
        score: typeof detail.score === "number" ? detail.score : 0,
        suggestions: Array.isArray(detail.suggestions)
          ? detail.suggestions.map(String)
          : undefined,
      });
    }
  }

  if (scores.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {scores.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.label}</span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                getScoreColor(item.score)
              )}
            >
              {item.score}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                getBarColor(item.score)
              )}
              style={{ width: `${item.score}%` }}
            />
          </div>
          {item.suggestions && item.suggestions.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {item.suggestions.slice(0, 2).map((s, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground pl-3 relative before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}
