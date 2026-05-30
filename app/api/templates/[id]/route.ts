import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * GET /api/templates/[id] - Get a single template
 * POST /api/templates/[id] - Fork (copy) a template
 * PATCH /api/templates/[id] - Rate a template
 * DELETE /api/templates/[id] - Delete own template
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("templates")
    .select("*, author:profiles(display_name, email)")
    .eq("id", id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Increment view/use count
  await supabase
    .from("templates")
    .update({ uses_count: (template.uses_count || 0) + 1 })
    .eq("id", id);

  return NextResponse.json({
    template: {
      ...template,
      author_name: (template.author as Record<string, unknown>)?.display_name ||
        (template.author as Record<string, unknown>)?.email || "Anonymous",
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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get original template
  const { data: original } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Fork it
  const { data: fork, error } = await supabase
    .from("templates")
    .insert({
      title: `${original.title} (Fork)`,
      description: original.description,
      agent_id: original.agent_id,
      content: original.content,
      category: original.category,
      tags: original.tags,
      is_public: false, // Forks start as private
      author_id: user.id,
      forked_from: id,
      uses_count: 0,
      forks_count: 0,
      rating: 0,
      rating_count: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to fork template" }, { status: 500 });
  }

  // Increment fork count on original
  await supabase
    .from("templates")
    .update({ forks_count: (original.forks_count || 0) + 1 })
    .eq("id", id);

  return NextResponse.json({ template: fork }, { status: 201 });
}

const RatingSchema = z.object({
  rating: z.number().min(1).max(5),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const { rating } = parsed.data;

  // Get current template
  const { data: template } = await supabase
    .from("templates")
    .select("rating, rating_count, author_id")
    .eq("id", id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Cannot rate own template
  if (template.author_id === user.id) {
    return NextResponse.json({ error: "Cannot rate your own template" }, { status: 400 });
  }

  // Calculate new average rating
  const currentTotal = (template.rating || 0) * (template.rating_count || 0);
  const newCount = (template.rating_count || 0) + 1;
  const newAvg = Math.round(((currentTotal + rating) / newCount) * 10) / 10;

  await supabase
    .from("templates")
    .update({ rating: newAvg, rating_count: newCount })
    .eq("id", id);

  return NextResponse.json({ rating: newAvg, ratingCount: newCount });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: template } = await supabase
    .from("templates")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!template || template.author_id !== user.id) {
    return NextResponse.json({ error: "Not authorized to delete this template" }, { status: 403 });
  }

  await supabase.from("templates").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
