"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Animated demo "video" showing a user journey:
 * 1. User writes a mediocre cold email → scores 41/100
 * 2. WriteScore provides suggestions
 * 3. User applies the AI rewrite → scores 89/100
 * 4. User sends the email
 * 5. Gets a confirmed booking reply
 */

type DemoStep =
  | "draft"
  | "analyzing"
  | "low-score"
  | "suggestions"
  | "rewrite"
  | "high-score"
  | "sent"
  | "reply";

const ORIGINAL_EMAIL = `Hi there,

I wanted to reach out because we have a product that might help your team. We offer AI-powered solutions for businesses of all sizes.

Would you be open to a quick call sometime next week to discuss?

Thanks,
Alex`;

const REWRITTEN_EMAIL = `Hi Sarah,

Noticed your team at Acme just expanded the content ops department (congrats!). We helped Stripe's content team cut review cycles by 40% using AI scoring — thought it might be relevant as you scale.

Would a 15-min call Thursday at 2pm work to see if it's a fit?

Best,
Alex`;

const SUGGESTIONS = [
  "Add specific personalization (mention their company/role)",
  "Lead with value, not your product description",
  "Include a concrete result or case study",
  "Propose a specific time (reduces friction)",
  "Remove generic phrases like 'businesses of all sizes'",
];

const REPLY_EMAIL = `Hi Alex,

Thursday at 2pm works perfectly! I've been looking for exactly this — our team reviews 50+ pieces per week and it's been a bottleneck.

Looking forward to the call. Sent you a calendar invite.

Best,
Sarah
Head of Content, Acme Inc.`;

const STEP_DURATIONS: Record<DemoStep, number> = {
  draft: 3000,
  analyzing: 1500,
  "low-score": 2500,
  suggestions: 3000,
  rewrite: 3500,
  "high-score": 2500,
  sent: 2000,
  reply: 4000,
};

export function DemoVideo() {
  const [step, setStep] = useState<DemoStep>("draft");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps: DemoStep[] = [
    "draft",
    "analyzing",
    "low-score",
    "suggestions",
    "rewrite",
    "high-score",
    "sent",
    "reply",
  ];

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (!isPlaying) return;

    // Typing animation for rewrite step
    if (step === "rewrite") {
      setTypedChars(0);
      let charIndex = 0;
      typingRef.current = setInterval(() => {
        charIndex += 2;
        setTypedChars(charIndex);
        if (charIndex >= REWRITTEN_EMAIL.length) {
          if (typingRef.current) clearInterval(typingRef.current);
        }
      }, 20);
    }

    timerRef.current = setTimeout(() => {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setStep(steps[nextIndex]);
      } else {
        setIsPlaying(false);
      }
    }, STEP_DURATIONS[step]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typingRef.current) clearInterval(typingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isPlaying]);

  // Auto-play when section becomes visible
  useEffect(() => {
    if (!containerRef.current || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          setIsPlaying(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  function handlePlayPause() {
    if (!hasStarted) {
      setHasStarted(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handleReplay() {
    setStep("draft");
    setTypedChars(0);
    setIsPlaying(true);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Main demo container */}
      <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
        {/* Top bar (fake browser) */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/80 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground border border-border">
              writescore.io/analyses/new
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative min-h-[400px] sm:min-h-[440px]">
          {/* Step: Draft email */}
          <DemoFrame visible={step === "draft"}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Agent: 📬 Cold Email Grader
                </div>
              </div>
              <div className="rounded-lg border border-border p-4 bg-muted/30 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {ORIGINAL_EMAIL}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium animate-pulse">
                  Analyze
                </div>
              </div>
            </div>
          </DemoFrame>

          {/* Step: Analyzing */}
          <DemoFrame visible={step === "analyzing"}>
            <div className="flex flex-col items-center justify-center h-full min-h-[380px] gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Analyzing with Cold Email Grader...
              </p>
            </div>
          </DemoFrame>

          {/* Step: Low score result */}
          <DemoFrame visible={step === "low-score"}>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <svg viewBox="0 0 120 120" className="w-28 h-28">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${(41 / 100) * 327} 327`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-1000"
                  />
                  <text
                    x="60"
                    y="65"
                    textAnchor="middle"
                    className="fill-red-500 text-3xl font-bold"
                    fontSize="32"
                    fontWeight="800"
                  >
                    41
                  </text>
                  <text
                    x="60"
                    y="82"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="11"
                  >
                    /100
                  </text>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-600">Needs Improvement</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generic opener, no personalization, weak CTA, no social proof
                </p>
              </div>
            </div>
          </DemoFrame>

          {/* Step: Suggestions */}
          <DemoFrame visible={step === "suggestions"}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                  5
                </div>
                <span className="text-sm font-semibold">
                  Suggestions to Improve
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-sm animate-fadeIn"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className="text-amber-600 shrink-0 mt-0.5">
                      {i + 1}.
                    </span>
                    <span className="text-amber-900">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                  Apply AI Rewrite
                </div>
              </div>
            </div>
          </DemoFrame>

          {/* Step: Rewrite with typing effect */}
          <DemoFrame visible={step === "rewrite"}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-sm font-medium text-emerald-600">
                  AI Rewrite Applied
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 p-4 bg-emerald-50/50 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {REWRITTEN_EMAIL.slice(0, typedChars)}
                {typedChars < REWRITTEN_EMAIL.length && (
                  <span className="inline-block w-0.5 h-4 bg-primary animate-blink" />
                )}
              </div>
            </div>
          </DemoFrame>

          {/* Step: High score */}
          <DemoFrame visible={step === "high-score"}>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <svg viewBox="0 0 120 120" className="w-28 h-28">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(89 / 100) * 327} 327`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-1000"
                  />
                  <text
                    x="60"
                    y="65"
                    textAnchor="middle"
                    className="fill-emerald-500 text-3xl font-bold"
                    fontSize="32"
                    fontWeight="800"
                  >
                    89
                  </text>
                  <text
                    x="60"
                    y="82"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="11"
                  >
                    /100
                  </text>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-emerald-600">
                  Excellent!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Personalized, value-led, specific CTA, social proof included
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-medium text-emerald-700">
                Score improved: 41 → 89 (+48 points)
              </div>
            </div>
          </DemoFrame>

          {/* Step: Sent */}
          <DemoFrame visible={step === "sent"}>
            <div className="flex flex-col items-center justify-center h-full min-h-[380px] gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <p className="text-lg font-semibold">Email Sent!</p>
              <p className="text-sm text-muted-foreground">
                Optimized email delivered to sarah@acme.com
              </p>
            </div>
          </DemoFrame>

          {/* Step: Reply / Booking confirmation */}
          <DemoFrame visible={step === "reply"}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                  S
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Sarah Chen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Head of Content, Acme Inc.
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Booking Confirmed
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 p-4 bg-emerald-50/30 text-sm leading-relaxed whitespace-pre-wrap">
                {REPLY_EMAIL}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-sm font-medium text-emerald-700">
                  Meeting booked: Thursday at 2:00 PM
                </span>
              </div>
            </div>
          </DemoFrame>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleReplay}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <StepIndicator steps={steps} current={step} />
          <div className="text-xs text-muted-foreground">
            {currentStepIndex + 1}/{steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoFrame({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-300",
        visible ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}

function StepIndicator({
  steps,
  current,
}: {
  steps: DemoStep[];
  current: DemoStep;
}) {
  const currentIndex = steps.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i === currentIndex
              ? "bg-primary w-4"
              : i < currentIndex
              ? "bg-primary/50"
              : "bg-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}
