import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAgent, canAccessAgent, validAgentIds } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import { z } from "zod";
import OpenAI from "openai";

const WebhookAnalyzeSchema = z.object({
  text: z.string().min(1),
  agentId: z.string().refine((val) => validAgentIds.includes(val)),
  title: z.string().max(200).optional(),
  callbackUrl: z.string().url().optional(),
});

/**
 * POST /api/integrations/webhook
 * Public webhook API for Zapier/Make/custom integrations.
 * Authenticated via API key in Authorization header.
 * 
 * Headers: Authorization: Bearer <api_key>
 * Body: { text, agentId, title?, callbackUrl? }
 * 
 * Returns analysis result synchronously, or posts to callbackUrl if provided.
 */

export async function POST(request: NextRequest) {
  // Extract API key
  const authHeader = request.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key. Use Authorization: Bearer <your_api_key>" },
      { status: 401 }
    );
  }

  // Look up API key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: keyRecord } = await supabase
    .from("api_keys")
    .select("id, user_id, team_id, scopes, rate_limit, last_used_at")
    .eq("key_hash", hashApiKey(apiKey))
    .eq("is_active", true)
    .single();

  if (!keyRecord) {
    return NextResponse.json(
      { error: "Invalid or revoked API key" },
      { status: 401 }
    );
  }

  // Update last used
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id);

  // Get user plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", keyRecord.user_id)
    .single();

  const plan = profile?.subscription_status || "free";

  // Only team plan gets API access
  if (plan !== "team") {
    return NextResponse.json(
      { error: "API access requires a Team plan. Upgrade at agentdesk.app/settings" },
      { status: 403 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = WebhookAnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { text, agentId, title, callbackUrl } = parsed.data;

  // Plan access check
  if (!canAccessAgent(plan, agentId)) {
    return NextResponse.json(
      { error: `Agent ${agentId} not available on your plan` },
      { status: 403 }
    );
  }

  // Input length check
  const maxLen = PLAN_LIMITS[plan]?.maxInputLength || 100000;
  if (text.length > maxLen) {
    return NextResponse.json(
      { error: `Input exceeds max length of ${maxLen} characters` },
      { status: 400 }
    );
  }

  // Run analysis
  const agent = getAgent(agentId);

  try {
    const grok = new OpenAI({
      apiKey: process.env.XAI_API_KEY!,
      baseURL: "https://api.x.ai/v1",
      timeout: 55000,
    });

    const completion = await grok.chat.completions.create({
      model: "grok-3",
      messages: [
        { role: "system", content: agent.systemPrompt },
        {
          role: "user",
          content: `Analyze the following text. Return JSON.\n\n<user_input>\n${text}\n</user_input>`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    const score = Math.min(100, Math.max(0, result.score || 0));

    // Save analysis
    const { data: analysis } = await supabase
      .from("analyses")
      .insert({
        user_id: keyRecord.user_id,
        team_id: keyRecord.team_id,
        title: title || `API: ${text.slice(0, 50)}`,
        input_text: text,
        agent_id: agentId,
        status: "completed",
        score,
        summary: result.summary,
        result,
        tokens_used: completion.usage?.total_tokens || 0,
        source: "api",
      })
      .select("id")
      .single();

    const response = {
      id: analysis?.id,
      score,
      summary: result.summary,
      suggestions: result.suggestions || [],
      rewrite: result.rewrite || null,
      flags: result.flags || [],
      details: result.details || {},
      agent: { id: agentId, name: agent.name },
      tokensUsed: completion.usage?.total_tokens || 0,
    };

    // If callback URL provided, also POST there
    if (callbackUrl) {
      fetch(callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      }).catch(() => { /* fire and forget */ });
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/webhook
 * Returns API documentation/schema for the webhook endpoint.
 */
export async function GET() {
  return NextResponse.json({
    name: "AgentDesk Webhook API",
    version: "1.0",
    description: "Analyze text with AI agents via API. Team plan required.",
    endpoint: "POST /api/integrations/webhook",
    authentication: "Bearer token (API key from Settings > Integrations)",
    requestBody: {
      text: { type: "string", required: true, description: "Text to analyze" },
      agentId: { type: "string", required: true, description: "Agent ID (e.g., cold-email-grader)" },
      title: { type: "string", required: false, description: "Title for the analysis" },
      callbackUrl: { type: "string", required: false, description: "URL to POST results to" },
    },
    responseShape: {
      id: "analysis UUID",
      score: "0-100",
      summary: "one-sentence verdict",
      suggestions: "string[]",
      rewrite: "string | null",
      flags: "{ severity, message, context }[]",
      details: "object (agent-specific breakdown)",
    },
    availableAgents: validAgentIds,
    rateLimits: "1000 requests/day per API key",
  });
}

function hashApiKey(key: string): string {
  // Simple hash for lookup - in production use crypto.subtle
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(key).digest("hex");
}
