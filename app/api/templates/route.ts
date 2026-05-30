import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validAgentIds } from "@/lib/agents";
import { z } from "zod";

const CreateTemplateSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  agentId: z.string().refine((v) => validAgentIds.includes(v)),
  content: z.string().min(20).max(50000),
  category: z.string(),
  tags: z.array(z.string().max(30)).max(5),
  isPublic: z.boolean().default(true),
});

/**
 * GET /api/templates - Browse community templates
 * POST /api/templates - Create a new template
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const agentId = searchParams.get("agentId");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "popular";
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("templates")
    .select("*, author:profiles(display_name, email)", { count: "exact" })
    .eq("is_public", true);

  if (agentId) query = query.eq("agent_id", agentId);
  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);

  // Sort
  switch (sort) {
    case "highest-rated":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "most-forked":
      query = query.order("forks_count", { ascending: false });
      break;
    default: // popular
      query = query.order("uses_count", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: templates, count } = await query;

  return NextResponse.json({
    templates: (templates || []).map((t) => ({
      ...t,
      author_name: (t.author as Record<string, unknown>)?.display_name ||
        (t.author as Record<string, unknown>)?.email || "Anonymous",
      author: undefined,
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, description, agentId, content, category, tags, isPublic } = parsed.data;

  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      title,
      description,
      agent_id: agentId,
      content,
      category,
      tags,
      is_public: isPublic,
      author_id: user.id,
      uses_count: 0,
      forks_count: 0,
      rating: 0,
      rating_count: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }

  return NextResponse.json({ template }, { status: 201 });
}
