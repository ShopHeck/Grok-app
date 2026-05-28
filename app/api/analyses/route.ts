import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAnalysis } from "@/lib/grok";
import { canAccessAgent, getAgent, validAgentIds } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const CreateAnalysisSchema = z.object({
  title: z.string().min(1).max(200),
  inputText: z.string().min(1),
  agentId: z.string().refine((val) => validAgentIds.includes(val), {
    message: "Invalid agent ID",
  }),
  customInstructions: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(user.id, "analysis");
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please wait before submitting another analysis.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, inputText, agentId, customInstructions } = parsed.data;

  // Get user profile for plan check
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status || "free";

  // Check agent access
  if (!canAccessAgent(plan, agentId)) {
    return NextResponse.json(
      {
        error: "Upgrade required",
        message: `The ${getAgent(agentId).name} agent requires a ${getAgent(agentId).tier} plan or higher.`,
      },
      { status: 403 }
    );
  }

  // Check input length limit
  const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  if (inputText.length > planLimits.maxInputLength) {
    return NextResponse.json(
      {
        error: "Input too long",
        message: `Your plan allows up to ${planLimits.maxInputLength.toLocaleString()} characters. Upgrade for longer inputs.`,
        maxLength: planLimits.maxInputLength,
      },
      { status: 400 }
    );
  }

  // Check monthly quota
  if (planLimits.maxAnalysesPerMonth > 0) {
    const { data: usage } = await supabase
      .from("usage")
      .select("analysis_count")
      .eq("user_id", user.id)
      .eq(
        "period_start",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString().split("T")[0]
      );

    const totalUsage = (usage || []).reduce(
      (sum, row) => sum + (row.analysis_count || 0),
      0
    );

    if (totalUsage >= planLimits.maxAnalysesPerMonth) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: `You've used all ${planLimits.maxAnalysesPerMonth} analyses this month. Upgrade for unlimited access.`,
          usage: totalUsage,
          limit: planLimits.maxAnalysesPerMonth,
        },
        { status: 429 }
      );
    }
  }

  // Create analysis record
  const { data: analysis, error: insertError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      title,
      input_text: inputText,
      agent_id: agentId,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !analysis) {
    console.error("Insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 }
    );
  }

  // Run the analysis
  try {
    const { result, tokensUsed } = await runAnalysis({
      agentId,
      inputText,
      customInstructions,
    });

    // Update analysis with results
    await supabase
      .from("analyses")
      .update({
        status: "completed",
        result,
        score: result.score,
        summary: result.summary,
        tokens_used: tokensUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysis.id);

    // Increment usage counter
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_agent_id: agentId,
      p_tokens: tokensUsed,
    });

    return NextResponse.json(
      { id: analysis.id, status: "completed", score: result.score },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis processing failed";

    await supabase
      .from("analyses")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysis.id);

    return NextResponse.json(
      { error: "Analysis failed", message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agent");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("analyses")
    .select("id, title, agent_id, status, score, summary, created_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (agentId) {
    query = query.eq("agent_id", agentId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: analyses, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    analyses: analyses || [],
    total: count || 0,
    limit,
    offset,
  });
}
