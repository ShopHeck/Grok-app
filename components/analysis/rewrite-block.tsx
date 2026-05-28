"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, FileText } from "lucide-react";

interface RewriteBlockProps {
  rewrite: string;
  label?: string;
}

export function RewriteBlock({ rewrite, label = "Suggested Rewrite" }: RewriteBlockProps) {
  const [copied, setCopied] = useState(false);

  if (!rewrite) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">{label}</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">
        {rewrite}
      </div>
    </div>
  );
}
