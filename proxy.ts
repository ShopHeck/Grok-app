import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 Proxy (formerly middleware).
 * Handles auth session refresh and route protection.
 *
 * IMPORTANT: This must never crash — a crash here takes down the entire site.
 * We wrap everything in try/catch and only run auth logic on protected routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth entirely for public routes (landing page, static assets, share pages)
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, attempt session management
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("[proxy] Session update failed:", error);
    // Don't crash — just pass through
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
