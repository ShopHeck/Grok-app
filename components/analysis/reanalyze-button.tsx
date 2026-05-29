"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";

interface ReanalyzeButtonProps {
  analysisId: string;
  agentId: string;
  inputText: string;
  title: string;
}

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
    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title} (v2)`,
          inputText,
          agentId,
          parentId: analysisId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/analyses/${data.id}?compare=${analysisId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReanalyze}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCcw className="h-3.5 w-3.5" />
      )}
      Re-analyze
    </Button>
  );
}
