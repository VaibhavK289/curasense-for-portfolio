import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/db/auth";

/**
 * List of public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/health",
];

/**
 * Check if the route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * API Authentication Middleware
 * 
 * This middleware can be applied to protect API routes.
 * Import and use in your middleware.ts file.
 */
export async function apiAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only apply to API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

/**
 * Helper to extract user from middleware-injected headers
 */
export function getUserFromHeaders(headers: Headers) {
  return {
    userId: headers.get("x-user-id"),
    email: headers.get("x-user-email"),
    role: headers.get("x-user-role"),
  };
}
