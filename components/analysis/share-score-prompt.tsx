"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Share2, X, Twitter, Linkedin, Copy, Check, Trophy } from "lucide-react";

interface ShareScorePromptProps {
  score: number;
  agentName: string;
  agentIcon: string;
  shareUrl?: string;
  analysisId: string;
}

/**
 * Shows a share prompt after high scores (85+).
 * Encourages users to share their results on social media.
 */
export function ShareScorePrompt({
  score,
  agentName,
  agentIcon,
  shareUrl,
  analysisId,
}: ShareScorePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Only show for high scores
  if (score < 85 || dismissed) return null;

  const shareText = `${agentIcon} Just scored ${score}/100 on my ${agentName.toLowerCase()} with AgentDesk! AI-powered writing analysis is a game changer.`;
  const url = shareUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/share/${analysisId}`;

  async function handleCreateShare() {
    if (shareUrl) return; // Already shared
    setSharing(true);
    try {
      const res = await fetch(`/api/analyses/${analysisId}/share`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.shareId) {
        // URL will be used by social buttons
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleCopy() {
    await handleCreateShare();
    await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openTwitter() {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "width=550,height=420");
  }

  function openLinkedIn() {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, "_blank", "width=550,height=420");
  }

  return (
    <Card className="relative border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-800">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 text-muted-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <CardContent className="py-4 px-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Trophy className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Exceptional score!</h3>
              <Badge className="bg-emerald-600 text-[10px]">Top 10%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Your {agentName.toLowerCase()} scored {score}/100 — that&apos;s better than 90% of
              submissions. Share it with your network!
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openTwitter}
                className="gap-1.5 text-xs h-7"
              >
                <Twitter className="h-3 w-3" /> Post on X
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openLinkedIn}
                className="gap-1.5 text-xs h-7"
              >
                <Linkedin className="h-3 w-3" /> LinkedIn
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn("gap-1.5 text-xs h-7", copied && "text-emerald-600")}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
