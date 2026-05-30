"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProPreviewGateProps {
  /** The content to blur/gate */
  children: React.ReactNode;
  /** Whether the user has access (pro/team plan) */
  hasAccess: boolean;
  /** What feature this gates (for messaging) */
  featureName?: string;
  /** Whether to show a blurred preview vs fully hidden */
  showPreview?: boolean;
}

/**
 * Wraps content that requires Pro plan.
 * Free users see a blurred preview with upgrade CTA.
 * Pro+ users see the content normally.
 */
export function ProPreviewGate({
  children,
  hasAccess,
  featureName = "this feature",
  showPreview = true,
}: ProPreviewGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      {showPreview && (
        <div
          className={cn(
            "pointer-events-none select-none",
            "blur-[6px] opacity-60"
          )}
          aria-hidden="true"
        >
          {children}
        </div>
      )}

      {/* Overlay CTA */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 text-center p-6",
          showPreview
            ? "absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg"
            : "border border-dashed border-border rounded-lg bg-muted/30"
        )}
      >
        <div className="flex items-center gap-2">
          {showPreview ? (
            <Eye className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <Badge variant="secondary" className="text-xs">
            Pro
          </Badge>
        </div>

        <div>
          <p className="font-medium text-sm mb-0.5">
            {showPreview ? "Upgrade to unlock" : "Pro feature"}
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {showPreview
              ? `Access ${featureName} with a Pro plan`
              : `${featureName} requires a Pro plan`}
          </p>
        </div>

        <Link href="/settings?upgrade=true">
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Upgrade
          </Button>
        </Link>
      </div>
    </div>
  );
}
