"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { agentMap } from "@/lib/agents";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalBest {
  score: number;
  date: string;
}

export function PersonalBests() {
  const [bests, setBests] = useState<Record<string, PersonalBest>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/streaks");
        if (res.ok) {
          const data = await res.json();
          setBests(data.personalBests || {});
        }
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const entries = Object.entries(bests);
  if (entries.length === 0) return null;

  // Sort by score descending
  const sorted = entries.sort((a, b) => b[1].score - a[1].score);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-amber-500" />
          Personal Bests
        </CardTitle>
        <CardDescription>
          Your highest score per agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sorted.slice(0, 6).map(([agentId, best]) => {
            const agent = agentMap[agentId];
            if (!agent) return null;

            return (
              <div
                key={agentId}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors"
              >
                <span className="text-lg">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        best.score >= 90
                          ? "text-emerald-600"
                          : best.score >= 70
                            ? "text-amber-600"
                            : "text-foreground"
                      )}
                    >
                      {best.score}
                    </span>
                    {best.score >= 90 && (
                      <Badge variant="default" className="text-[9px] px-1 py-0 bg-emerald-600">
                        ★
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {agent.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
