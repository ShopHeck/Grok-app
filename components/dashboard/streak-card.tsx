"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap } from "lucide-react";

interface StreakData {
  streak: {
    current: number;
    longest: number;
    lastDate: string;
    isActiveToday: boolean;
  };
  improvement: number;
  milestones: {
    days: number;
    reward: string;
    claimed: boolean;
  }[];
}

export function StreakCard() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreak() {
      try {
        const res = await fetch("/api/streaks");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStreak();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { streak, improvement, milestones } = data;
  const nextMilestone = milestones.find((m) => m.days > streak.current);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-5 w-5 text-orange-500" />
          Writing Streak
        </CardTitle>
        <CardDescription>
          Consistency is the key to better writing
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Streak display */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "text-4xl font-bold tabular-nums",
                streak.current > 0 ? "text-orange-500" : "text-muted-foreground"
              )}
            >
              {streak.current}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">
              {streak.current === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {/* Status */}
            <div className="flex items-center gap-2">
              {streak.isActiveToday ? (
                <Badge variant="default" className="gap-1 bg-emerald-600 text-xs">
                  <Zap className="h-3 w-3" /> Active today
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Run an analysis to extend your streak!
                </Badge>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Best: {streak.longest} days
              </span>
              {improvement !== 0 && (
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    improvement > 0 ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {improvement > 0 ? "↑" : "↓"} {Math.abs(improvement)} pts avg
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Next milestone */}
        {nextMilestone && streak.current > 0 && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">
                {nextMilestone.days - streak.current} more{" "}
                {nextMilestone.days - streak.current === 1 ? "day" : "days"} to next reward
              </p>
              <p className="text-xs text-muted-foreground truncate">
                🎁 {nextMilestone.reward}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (streak.current / nextMilestone.days) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Milestone badges */}
        {streak.current >= 3 && (
          <div className="flex flex-wrap gap-1.5">
            {milestones
              .filter((m) => m.days <= streak.current)
              .map((m) => (
                <Badge key={m.days} variant="secondary" className="text-[10px] gap-1">
                  🔥 {m.days}d
                </Badge>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
