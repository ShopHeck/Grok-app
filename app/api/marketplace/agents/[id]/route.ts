import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * GET /api/marketplace/agents/[id] — Get single marketplace agent
 * POST /api/marketplace/agents/[id] — Install/purchase agent
 * PATCH /api/marketplace/agents/[id] — Rate/review
 * DELETE /api/marketplace/agents/[id] — Unlist (author only)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("marketplace_agents")
    .select("*, author:profiles(display_name)")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({
    agent: {
      ...agent,
      author_name: (agent.author as unknown as Record<string, unknown>)?.display_name || "Anonymous",
      author: undefined,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


  // Check if already installed
  const { data: existing } = await supabase
    .from("user_marketplace_agents")
    .select("id")
    .eq("user_id", user.id)
    .eq("agent_id", id)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already installed" });
  }

  // Install
  await supabase.from("user_marketplace_agents").insert({
    user_id: user.id,
    agent_id: id,
    installed_at: new Date().toISOString(),
  });

  // Increment install count
  await supabase.rpc("increment_marketplace_installs", { p_agent_id: id });

  return NextResponse.json({ success: true, message: "Agent installed" }, { status: 201 });
}

const RatingSchema = z.object({ rating: z.number().min(1).max(5), review: z.string().max(500).optional() });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = RatingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { data: agent } = await supabase
    .from("marketplace_agents")
    .select("rating, rating_count, author_id")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (agent.author_id === user.id) return NextResponse.json({ error: "Cannot rate own agent" }, { status: 400 });

  const newCount = (agent.rating_count || 0) + 1;
  const newAvg = Math.round(((agent.rating * (agent.rating_count || 0)) + parsed.data.rating) / newCount * 10) / 10;

  await supabase.from("marketplace_agents").update({ rating: newAvg, rating_count: newCount }).eq("id", id);

  if (parsed.data.review) {
    await supabase.from("marketplace_reviews").insert({
      agent_id: id, user_id: user.id, rating: parsed.data.rating, review_text: parsed.data.review,
    });
  }

  return NextResponse.json({ rating: newAvg, ratingCount: newCount });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: agent } = await supabase
    .from("marketplace_agents")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!agent || agent.author_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await supabase.from("marketplace_agents").update({ is_published: false }).eq("id", id);
  return NextResponse.json({ success: true });
}
