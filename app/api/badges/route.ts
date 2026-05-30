import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/badges?score=87&agent=cold-email-grader&theme=light
 * Returns an SVG badge for embedding in emails, portfolios, etc.
 * Public endpoint (no auth required) - uses analysis share IDs for verification
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = parseInt(searchParams.get("score") || "0", 10);
  const agent = searchParams.get("agent") || "AgentDesk";
  const theme = searchParams.get("theme") || "light";
  const shareId = searchParams.get("id"); // optional: verify against real analysis

  // Validate score
  const validScore = Math.min(100, Math.max(0, score));

  // If shareId provided, verify it's real
  if (shareId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
      .from("analyses")
      .select("score, agent_id")
      .eq("share_id", shareId)
      .eq("status", "completed")
      .single();

    if (!data) {
      return new NextResponse("Badge not found", { status: 404 });
    }
  }

  // Determine colors
  const getScoreColor = (s: number) => {
    if (s >= 80) return { bg: "#10b981", text: "#ffffff" };
    if (s >= 60) return { bg: "#f59e0b", text: "#ffffff" };
    return { bg: "#ef4444", text: "#ffffff" };
  };

  const colors = getScoreColor(validScore);
  const isDark = theme === "dark";
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f9fafb" : "#374151";
  const borderColor = isDark ? "#374151" : "#e5e7eb";

  const agentLabel = formatAgentName(agent);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="32" viewBox="0 0 200 32">
  <rect width="200" height="32" rx="6" fill="${bgColor}" stroke="${borderColor}" stroke-width="1"/>
  <rect x="1" y="1" width="50" height="30" rx="5" fill="${colors.bg}"/>
  <text x="26" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="${colors.text}" text-anchor="middle">${validScore}</text>
  <text x="60" y="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="600" fill="${textColor}">${agentLabel}</text>
  <text x="60" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8" fill="${isDark ? "#9ca3af" : "#6b7280"}">Scored by AgentDesk</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function formatAgentName(id: string): string {
  const names: Record<string, string> = {
    "cold-email-grader": "Cold Email",
    "social-post-optimizer": "Social Post",
    "newsletter-grader": "Newsletter",
    "support-response-grader": "Support Reply",
    "ad-copy-grader": "Ad Copy",
    "landing-page-reviewer": "Landing Page",
    "listing-optimizer": "Listing",
    "resume-reviewer": "Resume",
    "contract-reviewer": "Contract",
    "pitch-deck-reviewer": "Pitch Deck",
    "technical-docs-reviewer": "Tech Docs",
    "proposal-analyzer": "Proposal",
    "privacy-policy-reviewer": "Privacy Policy",
    "job-post-analyzer": "Job Post",
  };
  return names[id] || id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
