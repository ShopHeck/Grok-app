import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { agentMap } from "@/lib/agents";

/**
 * GET /api/badges/og?id=<shareId>
 * Returns an SVG-based OG image card for social sharing.
 * Shows score, agent, summary in a beautiful card format.
 * Used as the og:image for shared analysis links.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("id");

  if (!shareId) {
    return new NextResponse("Missing id parameter", { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: analysis } = await supabase
    .from("analyses")
    .select("score, agent_id, title, summary, created_at")
    .eq("share_id", shareId)
    .eq("status", "completed")
    .single();

  if (!analysis) {
    return new NextResponse("Not found", { status: 404 });
  }

  const score = analysis.score || 0;
  const agent = agentMap[analysis.agent_id];
  const agentName = agent?.name || "Analysis";
  const agentIcon = agent?.icon || "🤖";
  const title = (analysis.title || "").slice(0, 60);
  const summary = (analysis.summary || "").slice(0, 100);

  // Score color
  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const scoreBg = score >= 80 ? "#ecfdf5" : score >= 60 ? "#fffbeb" : "#fef2f2";

  // Generate the OG image as SVG (1200x630 standard)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="score-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${scoreColor}"/>
      <stop offset="100%" stop-color="${scoreColor}99"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg-gradient)"/>

  <!-- Border accent -->
  <rect x="0" y="0" width="1200" height="4" fill="#6366f1"/>

  <!-- Logo area -->
  <text x="60" y="60" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="700" fill="#6366f1">⚡ AgentDesk</text>

  <!-- Main card -->
  <rect x="60" y="100" width="1080" height="440" rx="16" fill="white" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Score circle -->
  <circle cx="200" cy="320" r="100" fill="${scoreBg}"/>
  <circle cx="200" cy="320" r="85" fill="white" stroke="${scoreColor}" stroke-width="8"/>
  <text x="200" y="340" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="64" font-weight="800" fill="${scoreColor}" text-anchor="middle">${score}</text>
  <text x="200" y="370" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">/100</text>

  <!-- Content -->
  <text x="360" y="200" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" fill="#6b7280">${agentIcon} ${escapeXml(agentName)}</text>
  <text x="360" y="260" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="700" fill="#111827">${escapeXml(title)}</text>
  <text x="360" y="320" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="#4b5563">${escapeXml(summary)}</text>

  <!-- CTA -->
  <rect x="360" y="400" width="240" height="48" rx="8" fill="#6366f1"/>
  <text x="480" y="430" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle">Try it free →</text>

  <!-- Score label -->
  <text x="360" y="480" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#9ca3af">Scored with AI • agentdesk.app</text>

  <!-- Bottom branding -->
  <text x="1100" y="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#9ca3af" text-anchor="end">agentdesk.app</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
