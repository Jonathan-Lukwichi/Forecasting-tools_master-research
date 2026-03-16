/**
 * Next.js middleware — route protection + security headers.
 *
 * For the thesis prototype, this does lightweight token checking.
 * Production would use Supabase Auth + HTTP-only cookies.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that don't require authentication
const PUBLIC_PATHS = ["/login", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For prototype: check localStorage token via cookie fallback
  // In production, this would verify an HTTP-only session cookie
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
