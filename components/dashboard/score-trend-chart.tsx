"use client";

import { cn } from "@/lib/utils";

interface ScoreDataPoint {
  date: string;
  score: number;
  agentId: string;
}

interface ScoreTrendChartProps {
  data: ScoreDataPoint[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Run at least 2 analyses to see your score trend
      </div>
    );
  }

  // Take last 20 data points
  const points = data.slice(-20);
  const scores = points.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const range = maxScore - minScore || 1;

  const width = 100;
  const height = 40;
  const padding = { top: 2, bottom: 2, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate SVG path
  const pathPoints = points.map((point, i) => {
    const x = padding.left + (i / (points.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((point.score - minScore) / range) * chartHeight;
    return { x, y };
  });

  const linePath = pathPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Area fill path
  const areaPath = `${linePath} L ${pathPoints[pathPoints.length - 1].x} ${height} L ${pathPoints[0].x} ${height} Z`;

  // Trend calculation
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  const avgFirst =
    firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend = avgSecond - avgFirst;
  const latestScore = scores[scores.length - 1];

  return (
    <div className="flex flex-col gap-3">
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{latestScore}</p>
            <p className="text-xs text-muted-foreground">Latest score</p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend > 0
                ? "text-emerald-600"
                : trend < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
            {Math.abs(Math.round(trend))} pts
            <span className="text-xs font-normal text-muted-foreground">
              trend
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last {points.length} analyses
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-24 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + chartHeight * (1 - pct)}
              y2={padding.top + chartHeight * (1 - pct)}
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.15"
              strokeDasharray="1 1"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            className={cn(
              trend >= 0 ? "fill-emerald-500/10" : "fill-red-500/10"
            )}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              trend >= 0 ? "stroke-emerald-500" : "stroke-red-500"
            )}
          />

          {/* Data points */}
          {pathPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.8"
              className={cn(
                "transition-all",
                i === pathPoints.length - 1
                  ? trend >= 0
                    ? "fill-emerald-500"
                    : "fill-red-500"
                  : "fill-muted-foreground/40"
              )}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute top-0 right-1 text-[9px] text-muted-foreground">
          {maxScore}
        </div>
        <div className="absolute bottom-0 right-1 text-[9px] text-muted-foreground">
          {minScore}
        </div>
      </div>
    </div>
  );
}
