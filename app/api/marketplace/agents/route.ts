import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { DEFAULT_REVENUE_SHARE } from "@/lib/marketplace";

const CreateMarketplaceAgentSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().min(20).max(500),
  icon: z.string().max(4),
  category: z.string(),
  systemPrompt: z.string().min(100).max(10000),
  outputSchema: z.array(z.unknown()),
  scoringRubric: z.array(z.unknown()),
  placeholder: z.string().max(500),
  inputLabel: z.string().max(50),
  maxInputLength: z.number().min(500).max(100000),
  pricingType: z.enum(["free", "one_time", "subscription"]),
  priceCents: z.number().min(0).max(9999),
  isPublished: z.boolean().default(false),
});

/**
 * GET /api/marketplace/agents — Browse marketplace agents
 * POST /api/marketplace/agents — Create/publish a new marketplace agent
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "popular";
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("marketplace_agents")
    .select("*, author:profiles(display_name)", { count: "exact" })
    .eq("is_published", true)
    .eq("is_approved", true);

  if (category) query = query.eq("category", category);
  if (featured === "true") query = query.eq("is_featured", true);
  if (search) query = query.ilike("name", `%${search}%`);

  switch (sort) {
    case "highest-rated": query = query.order("rating", { ascending: false }); break;
    case "newest": query = query.order("created_at", { ascending: false }); break;
    case "trending": query = query.order("uses_count", { ascending: false }); break;
    case "most-used": query = query.order("uses_count", { ascending: false }); break;
    default: query = query.order("installs_count", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);
  const { data: agents, count } = await query;

  return NextResponse.json({
    agents: (agents || []).map((a) => ({
      ...a,
      author_name: (a.author as unknown as Record<string, unknown>)?.display_name || "Anonymous",
      author: undefined,
      system_prompt: undefined, // Don't expose prompts in listing
    })),
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify pro+ plan (creators must be paid users)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status === "free") {
    return NextResponse.json({ error: "Pro plan required to publish marketplace agents" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateMarketplaceAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;

  const { data: agent, error } = await supabase
    .from("marketplace_agents")
    .insert({
      name: d.name,
      description: d.description,
      icon: d.icon,
      category: d.category,
      system_prompt: d.systemPrompt,
      output_schema: d.outputSchema,
      scoring_rubric: d.scoringRubric,
      placeholder: d.placeholder,
      input_label: d.inputLabel,
      max_input_length: d.maxInputLength,
      pricing_type: d.pricingType,
      price_cents: d.priceCents,
      revenue_share_pct: DEFAULT_REVENUE_SHARE,
      is_published: d.isPublished,
      is_approved: d.pricingType === "free", // Free agents auto-approve
      is_featured: false,
      author_id: user.id,
      installs_count: 0,
      uses_count: 0,
      rating: 0,
      rating_count: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }

  return NextResponse.json({ agent }, { status: 201 });
}
