"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, BarChart3 } from "lucide-react";


interface TeamAnalyticsProps {
  teamId: string;
}

interface AnalyticsData {
  totalAnalyses: number;
  avgScore: number;
  scoreChange: number;
  topAgents: { agentId: string; name: string; icon: string; count: number; avgScore: number }[];
  memberStats: { userId: string; name: string; count: number; avgScore: number }[];
  weeklyTrend: { week: string; count: number; avgScore: number }[];
}

export function TeamAnalytics({ teamId }: TeamAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/teams/analytics?teamId=${teamId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.analytics);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [teamId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;


  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Analyses (30d)</CardDescription>
            <CardTitle className="text-3xl">{data.totalAnalyses}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> team total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Team Score</CardDescription>
            <CardTitle className="text-3xl">{data.avgScore}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              data.scoreChange > 0 ? "text-emerald-600" : data.scoreChange < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              <TrendingUp className="h-3.5 w-3.5" />
              {data.scoreChange > 0 ? "+" : ""}{data.scoreChange} pts this month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Members</CardDescription>
            <CardTitle className="text-3xl">{data.memberStats.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> contributors this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top agents & Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Agents Used</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.topAgents.map((agent) => (
              <div key={agent.agentId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span>{agent.icon}</span>
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{agent.count} uses</span>
                  <Badge variant="secondary" className="text-xs">{agent.avgScore} avg</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Member Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.memberStats.slice(0, 5).map((member, i) => (
              <div key={member.userId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{member.count} analyses</span>
                  <Badge variant="secondary" className="text-xs">{member.avgScore} avg</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
