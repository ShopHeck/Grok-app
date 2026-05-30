import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAgent, canAccessAgent, validAgentIds } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import { z } from "zod";
import OpenAI from "openai";


const AnalyzeSchema = z.object({
  text: z.string().min(1).max(100000),
  agent_id: z.string().refine((v) => validAgentIds.includes(v)),
  title: z.string().max(200).optional(),
  options: z.object({
    strictness: z.enum(["lenient", "balanced", "strict"]).optional(),
    industry: z.string().optional(),
    include_rewrite: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /api/v1/analyze — Public API endpoint for analysis
 * Auth: Bearer <api_key>
 * Pricing: $0.05/analysis or bundled with Team plan (1000/mo)
 * 
 * GET /api/v1/analyze — Returns API documentation
 */

export async function GET() {
  return NextResponse.json({
    name: "AgentDesk Public API",
    version: "1.0.0",
    description: "AI-powered text analysis across 15+ specialized agents",
    baseUrl: "https://agentdesk.app/api/v1",
    authentication: "Bearer token. Get your API key at agentdesk.app/settings",
    endpoints: {
      "POST /v1/analyze": {
        description: "Analyze text with any agent",
        body: {
          text: { type: "string", required: true, maxLength: 100000 },
          agent_id: { type: "string", required: true, enum: validAgentIds },
          title: { type: "string", required: false, maxLength: 200 },
          options: {
            strictness: { enum: ["lenient", "balanced", "strict"] },
            industry: { type: "string", description: "Industry for calibrated scoring" },
            include_rewrite: { type: "boolean", default: true },
          },
        },
        response: {
          id: "string (analysis UUID)",
          score: "number (0-100)",
          summary: "string",
          details: "object (agent-specific scoring breakdown)",
          suggestions: "string[]",
          rewrite: "string | null",
          flags: "{ severity, message, context }[]",
          tokens_used: "number",
          agent: "{ id, name, icon }",
        },
      },
      "GET /v1/agents": { description: "List available agents (coming soon)" },
    },
    pricing: {
      payAsYouGo: "$0.05 per analysis",
      teamPlan: "1,000 analyses/month included ($49/mo)",
      enterprise: "Custom volume pricing — contact sales",
    },
    rateLimits: { perMinute: 30, perDay: 1000 },
    sdks: {
      node: "npm install @agentdesk/sdk (coming soon)",
      python: "pip install agentdesk (coming soon)",
    },
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!apiKey) {
    return NextResponse.json({
      error: "authentication_required",
      message: "Include your API key: Authorization: Bearer <api_key>",
      docs: "https://agentdesk.app/api/v1/analyze",
    }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate API key
  const crypto = require("crypto");
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const { data: keyRecord } = await supabase
    .from("api_keys")
    .select("id, user_id, rate_limit, usage_count_today")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (!keyRecord) {
    return NextResponse.json({ error: "invalid_api_key", message: "API key not found or revoked" }, { status: 401 });
  }

  // Rate limit check
  if (keyRecord.usage_count_today >= (keyRecord.rate_limit || 1000)) {
    return NextResponse.json({ error: "rate_limit_exceeded", message: "Daily limit reached. Upgrade for higher limits." }, { status: 429 });
  }

  // Get plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, writing_dna")
    .eq("id", keyRecord.user_id)
    .single();

  const plan = profile?.subscription_status || "free";

  // Parse request
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = AnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.issues }, { status: 400 });
  }

  const { text, agent_id, title, options } = parsed.data;

  if (!canAccessAgent(plan, agent_id)) {
    return NextResponse.json({ error: "agent_not_available", message: `${agent_id} requires a higher plan` }, { status: 403 });
  }

  const maxLen = PLAN_LIMITS[plan]?.maxInputLength || 5000;
  if (text.length > maxLen) {
    return NextResponse.json({ error: "input_too_long", maxLength: maxLen, actual: text.length }, { status: 400 });
  }

  // Run analysis
  const agent = getAgent(agent_id);
  let systemPrompt = agent.systemPrompt;

  // Apply writing DNA if available
  if (profile?.writing_dna) {
    const { buildDNAPromptAddendum } = await import("@/lib/writing-dna");
    systemPrompt += "\n\n" + buildDNAPromptAddendum(profile.writing_dna);
  }

  // Apply strictness option
  if (options?.strictness === "strict") {
    systemPrompt += "\n\nIMPORTANT: Score VERY harshly. Penalize every issue. Most content should score below 50.";
  } else if (options?.strictness === "lenient") {
    systemPrompt += "\n\nIMPORTANT: Score generously. Focus only on major issues. Be encouraging.";
  }

  try {
    const grok = new OpenAI({ apiKey: process.env.XAI_API_KEY!, baseURL: "https://api.x.ai/v1", timeout: 55000 });

    const completion = await grok.chat.completions.create({
      model: "grok-3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze:\n\n<user_input>\n${text}\n</user_input>` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    const score = Math.min(100, Math.max(0, result.score || 0));

    // Save analysis
    const { data: analysis } = await supabase.from("analyses").insert({
      user_id: keyRecord.user_id,
      title: title || `API: ${text.slice(0, 50)}`,
      input_text: text,
      agent_id,
      status: "completed",
      score,
      summary: result.summary,
      result,
      tokens_used: completion.usage?.total_tokens || 0,
      source: "api_v1",
    }).select("id").single();

    // Increment usage
    await supabase.from("api_keys").update({
      usage_count_today: (keyRecord.usage_count_today || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", keyRecord.id);

    return NextResponse.json({
      id: analysis?.id,
      score,
      summary: result.summary,
      details: result.details || {},
      suggestions: result.suggestions || [],
      rewrite: options?.include_rewrite !== false ? (result.rewrite || null) : null,
      flags: result.flags || [],
      tokens_used: completion.usage?.total_tokens || 0,
      agent: { id: agent_id, name: agent.name, icon: agent.icon },
    });
  } catch (error) {
    return NextResponse.json({
      error: "analysis_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
