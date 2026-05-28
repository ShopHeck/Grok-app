"use client";

import { useState, useCallback } from "react";
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

type StreamStatus = "idle" | "connecting" | "streaming" | "parsing" | "done";

export function AnalysisForm({ userPlan, remainingQuota }: AnalysisFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "input">("select");
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
  const [streamedContent, setStreamedContent] = useState("");

  function handleAgentSelect(agent: AgentConfig) {
    setSelectedAgent(agent);
    setStep("input");
    setError(null);
  }

  function handleBack() {
    setStep("select");
    setError(null);
    setStreamStatus("idle");
    setStreamedContent("");
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAgent) return;

      setStreamStatus("connecting");
      setStreamedContent("");
      setError(null);

      try {
        const res = await fetch("/api/analyses/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:
              title ||
              `${selectedAgent.name} - ${new Date().toLocaleDateString()}`,
            inputText,
            agentId: selectedAgent.id,
            ...(selectedAgent.id === "custom" && customInstructions
              ? { customInstructions }
              : {}),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.message || data.error || "Failed to start analysis"
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            try {
              const event = JSON.parse(jsonStr);

              switch (event.type) {
                case "started":
                  setStreamStatus("streaming");
                  break;

                case "chunk":
                  setStreamedContent((prev) => prev + event.content);
                  break;

                case "complete":
                  setStreamStatus("done");
                  // Navigate to result page
                  router.push(`/analyses/${event.id}`);
                  return;

                case "error":
                  throw new Error(event.message);
              }
            } catch (parseErr) {
              if (
                parseErr instanceof Error &&
                parseErr.message !== "Unexpected end of JSON input"
              ) {
                throw parseErr;
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setStreamStatus("idle");
      }
    },
    [selectedAgent, title, inputText, customInstructions, router]
  );

  const isLoading = streamStatus !== "idle";

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          type="button"
          disabled={isLoading}
        >
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

      {/* Streaming progress */}
      {isLoading && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium text-sm">
                {streamStatus === "connecting" && "Connecting to AI..."}
                {streamStatus === "streaming" && "Analyzing your content..."}
                {streamStatus === "parsing" && "Finalizing results..."}
                {streamStatus === "done" && "Complete! Redirecting..."}
              </span>
            </div>
            {streamedContent && (
              <div className="bg-background/80 rounded-md p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {streamedContent.slice(-500)}
                </pre>
              </div>
            )}
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{
                  width:
                    streamStatus === "connecting"
                      ? "10%"
                      : streamStatus === "streaming"
                        ? `${Math.min(90, 20 + streamedContent.length / 50)}%`
                        : "100%",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-5 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
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
            Results stream in real-time as the AI analyzes
          </p>
          <Button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
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
