import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Whitelist of valid internal redirect paths
const ALLOWED_REDIRECTS = [
  "/dashboard",
  "/analyses",
  "/analyses/new",
  "/settings",
];

function isValidRedirect(path: string): boolean {
  // Must start with / and not contain protocol markers
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;

  // Check against whitelist or valid path patterns
  if (ALLOWED_REDIRECTS.includes(path)) return true;

  // Allow /analyses/[uuid] pattern
  if (/^\/analyses\/[a-f0-9-]+$/.test(path)) return true;

  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect path to prevent open redirect
  const redirectPath = isValidRedirect(next) ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}
