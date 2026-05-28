"use client";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ScoreRing({ score, size = "md", label }: ScoreRingProps) {
  const sizes = {
    sm: { container: "h-14 w-14", text: "text-sm", stroke: 3, radius: 22 },
    md: { container: "h-24 w-24", text: "text-2xl", stroke: 4, radius: 38 },
    lg: { container: "h-32 w-32", text: "text-3xl", stroke: 5, radius: 52 },
  };

  const { container, text, stroke, radius } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500";
    if (s >= 60) return "stroke-yellow-500";
    if (s >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", container)}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(radius + stroke) * 2} ${(radius + stroke) * 2}`}>
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className={cn("transition-all duration-1000 ease-out", getStrokeColor(score))}
          />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center font-bold", text, getColor(score))}>
          {score}
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground font-medium text-center">
          {label}
        </span>
      )}
    </div>
  );
}
