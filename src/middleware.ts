import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internal files, static assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAdmin = token?.role === "ADMIN";

  // CASE 1: /admin/login endpoint
  if (pathname === "/admin/login") {
    if (isAdmin) {
      // Authenticated ADMIN opens /admin/login -> redirect to /admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (isAuthenticated && !isAdmin) {
      // Authenticated CUSTOMER opens /admin/login -> redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Unauthenticated user -> allow access to dedicated Admin Login page
    return NextResponse.next();
  }

  // CASE 2: All protected /admin and /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      // Unauthenticated user opens /admin or /admin/* -> redirect to /admin/login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (!isAdmin) {
      // Authenticated CUSTOMER opens /admin or /admin/* -> redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Authenticated ADMIN -> allow access
    return NextResponse.next();
  }

  // CASE 3: Protected Customer authenticated routes (/dashboard, /account, /my-bookings)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/my-bookings")
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Both CUSTOMER and ADMIN are allowed access when authenticated
    return NextResponse.next();
  }

  // CASE 4: Customer authentication pages (/login, /signup) for logged-in users
  if (pathname === "/login" || pathname === "/signup") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Allow normal public/customer routes (/, /cars, /cars/[id], /packages, /locations, /contact, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};


