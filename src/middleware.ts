import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Apply i18n middleware first
  const intlResponse = intlMiddleware(request);

  // Extract locale from the path
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, "") || "/";

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathnameWithoutLocale === route,
  );

  // Update Supabase session
  const { user } = await updateSession(request);

  // Redirect unauthenticated users from protected routes to login
  if (!user && !isPublicRoute) {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from login to library
  if (user && pathnameWithoutLocale === "/login") {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] || routing.defaultLocale;
    const libraryUrl = new URL(`/${locale}/library`, request.url);
    return NextResponse.redirect(libraryUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
