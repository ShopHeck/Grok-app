"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

interface OnboardingProps {
  userName?: string;
  hasAnalyses: boolean;
}

export function Onboarding({ userName, hasAnalyses }: OnboardingProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || hasAnalyses) return null;

  const firstName = userName?.split(" ")[0] || "there";

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Welcome text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Getting Started
              </Badge>
            </div>
            <h2 className="text-xl font-bold mb-1">
              Welcome to AgentDesk, {firstName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get expert AI analysis in 3 easy steps:
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-2">
              <Step number={1} text="Pick an AI agent for your task" />
              <Step number={2} text="Paste your content (email, listing, contract, etc.)" />
              <Step number={3} text="Get a score, issues list, and an improved rewrite" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <Link href="/analyses/new">
              <Button className="gap-2">
                Run First Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Takes about 10 seconds
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-primary">{number}</span>
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
