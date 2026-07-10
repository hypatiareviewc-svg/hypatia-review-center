import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME_EXPORT,
} from "@/lib/admin-auth";

/**
 * Middleware that protects all /admin/* routes except /admin/login.
 * Redirects unauthenticated users to /admin/login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Only protect /admin/* paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME_EXPORT)?.value;

  if (!cookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySessionToken(cookie);

  if (!payload) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
