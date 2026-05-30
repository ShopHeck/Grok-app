"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { agentMap } from "@/lib/agents";
import type { Playbook, PlaybookStep } from "@/lib/templates";
import {
  CheckCircle2, Circle, ArrowRight, Play, Loader2, Sparkles,
} from "lucide-react";

interface PlaybookRunnerProps {
  playbook: Playbook;
  onStepComplete?: (step: number, analysisId: string) => void;
}

interface StepResult {
  analysisId: string;
  score: number;
  summary: string;
}

export function PlaybookRunner({ playbook, onStepComplete }: PlaybookRunnerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Record<number, StepResult>>({});
  const [running, setRunning] = useState(false);

  const totalSteps = playbook.steps.length;
  const completedSteps = Object.keys(results).length;
  const allComplete = completedSteps === totalSteps;
  const avgScore = allComplete
    ? Math.round(Object.values(results).reduce((a, b) => a + b.score, 0) / totalSteps)
    : null;

  function handleStepComplete(stepOrder: number, result: StepResult) {
    setResults((prev) => ({ ...prev, [stepOrder]: result }));
    onStepComplete?.(stepOrder, result.analysisId);

    // Auto-advance to next step
    if (stepOrder < totalSteps - 1) {
      setCurrentStep(stepOrder + 1);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {playbook.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {playbook.description}
            </CardDescription>
          </div>
          {allComplete && (
            <Badge variant="default" className="bg-emerald-600">
              Complete! Avg: {avgScore}/100
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedSteps}/{totalSteps}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {playbook.steps.map((step, i) => {
          const isActive = i === currentStep;
          const isComplete = !!results[step.order];
          const isLocked = i > currentStep && !isComplete;
          const agent = agentMap[step.agent_id];
          const result = results[step.order];

          return (
            <div
              key={step.order}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                isActive && "border-primary bg-primary/5",
                isComplete && "border-emerald-200 bg-emerald-50/50",
                isLocked && "opacity-50",
                !isActive && !isComplete && !isLocked && "border-border"
              )}
            >
              {/* Step indicator */}
              <div className="mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : isActive ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{step.title}</span>
                  {agent && (
                    <Badge variant="outline" className="text-[10px]">
                      {agent.icon} {agent.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>

                {/* Result */}
                {result && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Score: {result.score}/100
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {result.summary}
                    </span>
                  </div>
                )}

                {/* Action */}
                {isActive && !isComplete && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5 h-7 text-xs"
                      onClick={() => setCurrentStep(i)}
                      asChild
                    >
                      <a href={`/analyses/new?agent=${step.agent_id}${step.template_id ? `&template=${step.template_id}` : ""}`}>
                        <Play className="h-3 w-3" /> Start Step
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Score badge */}
              {result && (
                <div className={cn(
                  "text-sm font-bold tabular-nums",
                  result.score >= 80 ? "text-emerald-600" : result.score >= 60 ? "text-amber-600" : "text-red-500"
                )}>
                  {result.score}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
