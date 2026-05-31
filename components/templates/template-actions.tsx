"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  GitFork,
  Copy,
  Check,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateActionsProps {
  templateId: string;
  agentId: string;
  content: string;
  title: string;
}

export function TemplateActions({
  templateId,
  agentId,
  content,
  title,
}: TemplateActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [forking, setForking] = useState(false);
  const [forked, setForked] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  function handleUseTemplate() {
    // Navigate to analysis form pre-filled with this template
    const params = new URLSearchParams({
      agent: agentId,
      template: templateId,
      title: `From: ${title}`,
    });
    router.push(`/analyses/new?${params.toString()}`);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleFork() {
    setForking(true);
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setForked(true);
        // Navigate to the forked template
        setTimeout(() => {
          router.push(`/templates/${data.template.id}`);
        }, 1000);
      }
    } finally {
      setForking(false);
    }
  }

  async function handleRate(stars: number) {
    setRating(stars);
    setRatingLoading(true);
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
      if (res.ok) {
        setRatingSubmitted(true);
      }
    } finally {
      setRatingLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Primary actions */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-5 px-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Ready to use this template?
              </h3>
              <p className="text-xs text-muted-foreground">
                Click &ldquo;Use Template&rdquo; to open the analysis form pre-filled with
                this content. Customize it, then score it.
              </p>
            </div>
            <Button onClick={handleUseTemplate} className="gap-2 shrink-0">
              <Play className="h-4 w-4" /> Use Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary actions row */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Content
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFork}
          disabled={forking || forked}
          className="gap-1.5"
        >
          {forking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : forked ? (
            <>
              <Check className="h-3.5 w-3.5" /> Forked!
            </>
          ) : (
            <>
              <GitFork className="h-3.5 w-3.5" /> Fork Template
            </>
          )}
        </Button>

        {/* Star rating */}
        <div className="flex items-center gap-2 ml-auto">
          {ratingSubmitted ? (
            <span className="text-xs text-emerald-600 font-medium">
              Thanks for rating!
            </span>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">Rate:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    disabled={ratingLoading}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        (hoveredStar || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
