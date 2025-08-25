import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /dashboard)
  const path = request.nextUrl.pathname;

  // Define paths that are considered public (accessible without authentication)
  const isPublicPath = path === "/login";

  // Get the token from the cookies or headers
  const token = request.cookies.get("auth-storage")?.value;

  // Parse the token to check if user is authenticated
  let isAuthenticated = false;
  if (token) {
    try {
      const authData = JSON.parse(token);
      // Coerce to boolean to keep types and logic correct
      isAuthenticated = Boolean(
        authData.state?.isAuthenticated && authData.state?.token
      );
    } catch {
      // Invalid token format
      isAuthenticated = false;
    }
  }

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is authenticated and trying to access login page, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user is not authenticated and trying to access protected page, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
