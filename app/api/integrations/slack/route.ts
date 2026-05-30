import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAgent, canAccessAgent, validAgentIds } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import OpenAI from "openai";

/**
 * POST /api/integrations/slack
 * Handles Slack slash command: /agentdesk score <text>
 * Also handles Slack URL verification challenge.
 */

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  // Handle Slack URL verification (JSON)
  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body.type === "url_verification") {
      return NextResponse.json({ challenge: body.challenge });
    }
  }

  // Handle slash command (form-encoded)
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const command = formData.get("command") as string;
  const text = formData.get("text") as string;
  const userId = formData.get("user_id") as string;
  const responseUrl = formData.get("response_url") as string;
  const teamId = formData.get("team_id") as string;

  // Verify Slack token
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  if (!text || text.trim().length === 0) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Usage: `/agentdesk [agent] <your text>`\n\nAvailable agents: `email`, `social`, `newsletter`, `support`, `ad`, `listing`\n\nExample: `/agentdesk email Hi Sarah, I noticed your team just...`",
    });
  }

  // Parse agent from text
  const { agentId, inputText } = parseSlackInput(text);

  // Acknowledge immediately (Slack requires response within 3s)
  // We'll post the result to response_url async
  const acknowledgment = NextResponse.json({
    response_type: "ephemeral",
    text: `⚡ Analyzing with ${getAgent(agentId).name}... Results will appear shortly.`,
  });

  // Process async (fire and forget)
  processSlackAnalysis(agentId, inputText, responseUrl, teamId, userId).catch(
    console.error
  );

  return acknowledgment;
}

function parseSlackInput(text: string): {
  agentId: string;
  inputText: string;
} {
  const agentAliases: Record<string, string> = {
    email: "cold-email-grader",
    social: "social-post-optimizer",
    newsletter: "newsletter-grader",
    support: "support-response-grader",
    ad: "ad-copy-grader",
    listing: "listing-optimizer",
    resume: "resume-reviewer",
    contract: "contract-reviewer",
    pitch: "pitch-deck-reviewer",
    docs: "technical-docs-reviewer",
    proposal: "proposal-analyzer",
    privacy: "privacy-policy-reviewer",
    job: "job-post-analyzer",
    landing: "landing-page-reviewer",
  };

  const words = text.trim().split(/\s+/);
  const firstWord = words[0].toLowerCase();

  if (agentAliases[firstWord]) {
    return {
      agentId: agentAliases[firstWord],
      inputText: words.slice(1).join(" "),
    };
  }

  // Default to cold email grader
  return { agentId: "cold-email-grader", inputText: text };
}

async function processSlackAnalysis(
  agentId: string,
  inputText: string,
  responseUrl: string,
  slackTeamId: string,
  slackUserId: string
) {
  try {
    // Look up connected AgentDesk user via Slack team/user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: integration } = await supabase
      .from("integrations")
      .select("user_id")
      .eq("provider", "slack")
      .eq("provider_team_id", slackTeamId)
      .eq("provider_user_id", slackUserId)
      .single();

    let plan = "free";
    if (integration?.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", integration.user_id)
        .single();
      plan = profile?.subscription_status || "free";
    }

    // Check access
    if (!canAccessAgent(plan, agentId)) {
      await postToSlack(responseUrl, {
        response_type: "ephemeral",
        text: `🔒 The ${getAgent(agentId).name} agent requires a Pro plan. Upgrade at agentdesk.app/settings`,
      });
      return;
    }

    // Check input length
    const maxLen = PLAN_LIMITS[plan]?.maxInputLength || 5000;
    if (inputText.length > maxLen) {
      await postToSlack(responseUrl, {
        response_type: "ephemeral",
        text: `⚠️ Input too long (${inputText.length} chars). Max for your plan: ${maxLen.toLocaleString()} chars.`,
      });
      return;
    }

    // Run analysis
    const agent = getAgent(agentId);
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
          content: `Analyze the following text. Return your response as valid JSON.\n\n<user_input>\n${inputText}\n</user_input>`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    const score = Math.min(100, Math.max(0, result.score || 0));

    // Format Slack response
    const scoreEmoji = score >= 80 ? "🟢" : score >= 60 ? "🟡" : "🔴";
    const suggestions = (result.suggestions || []).slice(0, 3);

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${scoreEmoji} *Score: ${score}/100* — ${agent.icon} ${agent.name}\n\n${result.summary || "Analysis complete."}`,
        },
      },
    ];

    if (suggestions.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Top Suggestions:*\n${suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`,
        },
      });
    }

    if (result.rewrite) {
      const rewritePreview = result.rewrite.slice(0, 300);
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*AI Rewrite:*\n>${rewritePreview}${result.rewrite.length > 300 ? "..." : ""}`,
        },
      });
    }

    // Save analysis if user is connected
    if (integration?.user_id) {
      await supabase.from("analyses").insert({
        user_id: integration.user_id,
        title: `Slack: ${inputText.slice(0, 50)}`,
        input_text: inputText,
        agent_id: agentId,
        status: "completed",
        score,
        summary: result.summary,
        result,
        tokens_used: completion.usage?.total_tokens || 0,
        source: "slack",
      });
    }

    await postToSlack(responseUrl, {
      response_type: "in_channel",
      blocks,
    });
  } catch (error) {
    await postToSlack(responseUrl, {
      response_type: "ephemeral",
      text: `❌ Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Try again or visit agentdesk.app`,
    });
  }
}

async function postToSlack(url: string, body: unknown) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
