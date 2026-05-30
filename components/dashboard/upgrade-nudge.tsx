"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Lock, TrendingUp, Zap, X } from "lucide-react";

interface UpgradeNudgeProps {
  plan: string;
  analysesUsed: number;
  analysesLimit: number;
  avgScore: number | null;
}

type NudgeType = "quota-warning" | "quota-hit" | "score-comparison" | "feature-tease" | null;

export function UpgradeNudge({
  plan,
  analysesUsed,
  analysesLimit,
  avgScore,
}: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [nudgeType, setNudgeType] = useState<NudgeType>(null);

  useEffect(() => {
    if (plan !== "free") return;

    // Determine which nudge to show based on usage
    if (analysesLimit > 0 && analysesUsed >= analysesLimit) {
      setNudgeType("quota-hit");
    } else if (analysesLimit > 0 && analysesUsed >= analysesLimit * 0.7) {
      setNudgeType("quota-warning");
    } else if (avgScore && avgScore < 75) {
      setNudgeType("score-comparison");
    } else if (analysesUsed >= 3) {
      setNudgeType("feature-tease");
    }
  }, [plan, analysesUsed, analysesLimit, avgScore]);

  if (plan !== "free" || !nudgeType || dismissed) return null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2",
        nudgeType === "quota-hit"
          ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800"
          : "border-primary/20 bg-primary/5"
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 text-muted-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <CardContent className="py-5 px-5">
        {nudgeType === "quota-hit" && <QuotaHitNudge used={analysesUsed} />}
        {nudgeType === "quota-warning" && (
          <QuotaWarningNudge used={analysesUsed} limit={analysesLimit} />
        )}
        {nudgeType === "score-comparison" && (
          <ScoreComparisonNudge avgScore={avgScore!} />
        )}
        {nudgeType === "feature-tease" && <FeatureTeaseNudge />}
      </CardContent>
    </Card>
  );
}

function QuotaHitNudge({ used }: { used: number }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
        <Lock className="h-5 w-5 text-orange-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">
          You&apos;ve used all {used} analyses this month
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Your best score this month was impressive. Imagine what you could
          achieve with unlimited analyses — Pro users improve their scores by
          34% on average.
        </p>
        <Link href="/settings?upgrade=true">
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Unlock Unlimited
          </Button>
        </Link>
      </div>
    </div>
  );
}

function QuotaWarningNudge({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used;
  const percentage = Math.round((used / limit) * 100);

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm">
            {remaining} {remaining === 1 ? "analysis" : "analyses"} remaining
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {percentage}% used
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          You&apos;re on a roll! Upgrade to Pro to keep the momentum going with
          unlimited analyses and all 15 agents.
        </p>
        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <Link href="/settings?upgrade=true">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Upgrade to Pro
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ScoreComparisonNudge({ avgScore }: { avgScore: number }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">
          Your avg: {avgScore} → Pro users avg: {Math.min(avgScore + 18, 92)}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Pro users iterate more and use specialized agents — leading to
          significantly higher scores. Access all 15 agents and unlimited
          re-analyses to sharpen every piece of writing.
        </p>
        <Link href="/settings?upgrade=true">
          <Button variant="outline" size="sm" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> See Pro Features
          </Button>
        </Link>
      </div>
    </div>
  );
}

function FeatureTeaseNudge() {
  const proFeatures = [
    "Ad Copy Grader",
    "Contract Reviewer",
    "Pitch Deck Reviewer",
    "Technical Docs Reviewer",
  ];

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">
          Unlock 10 more specialized agents
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Pro includes agents for every business writing need:
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {proFeatures.map((f) => (
            <Badge key={f} variant="outline" className="text-[10px]">
              <Lock className="h-2.5 w-2.5 mr-1 opacity-50" />
              {f}
            </Badge>
          ))}
          <Badge variant="outline" className="text-[10px]">
            +6 more
          </Badge>
        </div>
        <Link href="/settings?upgrade=true">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Unlock All Agents
          </Button>
        </Link>
      </div>
    </div>
  );
}
