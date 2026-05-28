import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * POST /api/analyses/[id]/share - Generate a public share link for an analysis
 * DELETE /api/analyses/[id]/share - Revoke the share link
 */

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, share_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  // Return existing share link if already shared
  if (analysis.share_id) {
    return NextResponse.json({ shareId: analysis.share_id });
  }

  // Generate a unique share ID
  const shareId = randomBytes(12).toString("base64url");

  const { error } = await supabase
    .from("analyses")
    .update({ share_id: shareId, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ shareId });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("analyses")
    .update({ share_id: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
