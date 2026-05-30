"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface ReanalyzeButtonProps {
  analysisId: string;
  agentId: string;
  inputText: string;
  title: string;
}

/**
 * "Iterate" button that re-runs analysis on edited text.
 * Creates a new analysis linked as a version to the original.
 * Enables iteration mode → before/after comparison.
 */
export function ReanalyzeButton({
  analysisId,
  agentId,
  inputText,
  title,
}: ReanalyzeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReanalyze() {
    setLoading(true);
    // Navigate to analysis form pre-filled with current text
    // The "parent_id" query param enables iteration tracking
    const params = new URLSearchParams({
      agent: agentId,
      iterate: analysisId,
      title: `${title} (v2)`,
    });

    router.push(`/analyses/new?${params.toString()}`);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReanalyze}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      Iterate & Re-score
    </Button>
  );
}
