"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Link2, Loader2, Unlink } from "lucide-react";

interface ShareButtonProps {
  analysisId: string;
  initialShareId?: string | null;
}

export function ShareButton({ analysisId, initialShareId }: ShareButtonProps) {
  const [shareId, setShareId] = useState<string | null>(initialShareId ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analyses/${analysisId}/share`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.shareId) {
        setShareId(data.shareId);
        await copyLink(data.shareId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUnshare() {
    setLoading(true);
    try {
      await fetch(`/api/analyses/${analysisId}/share`, {
        method: "DELETE",
      });
      setShareId(null);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(id: string) {
    const url = `${window.location.origin}/share/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (shareId) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyLink(shareId)}
          className="gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnshare}
          disabled={loading}
          className="gap-1.5 text-muted-foreground"
          title="Revoke share link"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Unlink className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Link2 className="h-3.5 w-3.5" />
      )}
      Share
    </Button>
  );
}
