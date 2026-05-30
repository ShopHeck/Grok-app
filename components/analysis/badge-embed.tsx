"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Code, Image, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeEmbedProps {
  score: number;
  agentId: string;
  shareId?: string | null;
}

type EmbedFormat = "markdown" | "html" | "url";

/**
 * Shows embeddable badge options for an analysis result.
 * Users can copy markdown/HTML/URL to embed in portfolios, emails, READMEs, etc.
 */
export function BadgeEmbed({ score, agentId, shareId }: BadgeEmbedProps) {
  const [format, setFormat] = useState<EmbedFormat>("markdown");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agentdesk.app";
  const badgeUrl = `${baseUrl}/api/badges?score=${score}&agent=${agentId}&theme=${theme}${shareId ? `&id=${shareId}` : ""}`;
  const shareLink = shareId ? `${baseUrl}/share/${shareId}` : `${baseUrl}`;

  const embedCodes: Record<EmbedFormat, string> = {
    markdown: `[![AgentDesk Score](${badgeUrl})](${shareLink})`,
    html: `<a href="${shareLink}"><img src="${badgeUrl}" alt="AgentDesk Score: ${score}/100" /></a>`,
    url: badgeUrl,
  };

  async function handleCopy() {
    await navigator.clipboard.writeText(embedCodes[format]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Code className="h-4 w-4" />
          Embed Score Badge
        </CardTitle>
        <CardDescription className="text-xs">
          Add your score to emails, portfolios, or README files
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Badge preview */}
        <div className={cn(
          "flex items-center justify-center p-4 rounded-lg border",
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeUrl}
            alt={`Score: ${score}/100`}
            className="h-8"
          />
        </div>

        {/* Theme toggle */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Theme:</Label>
          <div className="flex gap-1">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                theme === "light"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                theme === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Format selector */}
        <div className="flex items-center gap-1.5">
          <FormatButton
            active={format === "markdown"}
            onClick={() => setFormat("markdown")}
            icon={<Code className="h-3 w-3" />}
            label="Markdown"
          />
          <FormatButton
            active={format === "html"}
            onClick={() => setFormat("html")}
            icon={<Code className="h-3 w-3" />}
            label="HTML"
          />
          <FormatButton
            active={format === "url"}
            onClick={() => setFormat("url")}
            icon={<Link2 className="h-3 w-3" />}
            label="URL"
          />
        </div>

        {/* Code display */}
        <div className="relative">
          <Input
            readOnly
            value={embedCodes[format]}
            className="font-mono text-xs pr-20 bg-muted/50"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 gap-1 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FormatButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
