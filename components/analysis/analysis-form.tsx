"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgentConfig } from "@/lib/agents/types";
import { AgentSelector } from "./agent-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface AnalysisFormProps {
  userPlan: string;
  remainingQuota: number;
}

export function AnalysisForm({ userPlan, remainingQuota }: AnalysisFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "input">("select");
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAgentSelect(agent: AgentConfig) {
    setSelectedAgent(agent);
    setStep("input");
    setError(null);
  }

  function handleBack() {
    setStep("select");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAgent) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `${selectedAgent.name} - ${new Date().toLocaleDateString()}`,
          inputText,
          agentId: selectedAgent.id,
          ...(selectedAgent.id === "custom" && customInstructions
            ? { customInstructions }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create analysis");
      }

      router.push(`/analyses/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  // Step 1: Agent selection
  if (step === "select") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Choose an Agent</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the AI agent that matches your task.
            {remainingQuota >= 0 && (
              <span className="ml-2 text-primary font-medium">
                {remainingQuota} analyses remaining this month
              </span>
            )}
          </p>
        </div>
        <AgentSelector
          selectedAgent={selectedAgent?.id ?? null}
          onSelect={handleAgentSelect}
          userPlan={userPlan}
        />
      </div>
    );
  }

  // Step 2: Input form
  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} type="button">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selectedAgent!.icon}</span>
          <div>
            <h2 className="text-lg font-semibold">{selectedAgent!.name}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedAgent!.description}
            </p>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder={`e.g., ${selectedAgent!.name} - ${new Date().toLocaleDateString()}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Custom instructions (only for custom agent) */}
            {selectedAgent!.id === "custom" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="customInstructions">
                  Analysis Instructions
                </Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Describe how you want the text analyzed. Be specific about what you're looking for..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Tell the AI exactly what to look for and how to score it.
                </p>
              </div>
            )}

            {/* Input text */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="inputText">{selectedAgent!.inputLabel}</Label>
              <Textarea
                id="inputText"
                placeholder={selectedAgent!.placeholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
                rows={12}
                className="resize-none font-mono text-sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{inputText.length.toLocaleString()} characters</span>
                <span>
                  Max: {selectedAgent!.maxInputLength.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Analysis typically takes 5-15 seconds
          </p>
          <Button
            type="submit"
            disabled={loading || !inputText.trim()}
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Analysis
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
