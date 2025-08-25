import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define admin routes that require special permissions
const adminRoutes: Record<string, string[]> = {
  "/admin": ["role:read"], // Basic admin access
  "/admin/users": ["user:read"],
  "/admin/roles": ["role:read"],
  "/admin/permissions": ["role:read"],
  "/admin/settings": ["settings:manage"],
};

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/test-auth",
  "/debug-session",
  "/debug-token",
  "/api/auth", // NextAuth API routes
  "/api/login",
  "/api/register",
  "/api/forgot-password",
  "/api/reset-password",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    try {
      // Get the session token
      const token = await getToken({ req: request });

      console.log("🔍 Middleware Debug:", {
        pathname,
        hasToken: !!token,
        tokenId: token?.id,
        tokenEmail: token?.email,
        tokenRole: token?.role,
        tokenKeys: token ? Object.keys(token) : [],
      });

      // Redirect to login if not authenticated
      if (!token) {
        console.log("❌ No token, redirecting to login");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role or required permissions
      const userRole = token.role as
        | { name?: string; permissions?: string[] }
        | undefined;
      const roleName = userRole?.name;
      const userPermissions = userRole?.permissions || [];

      console.log("🎭 Role check:", {
        roleName,
        userPermissions,
        isAdmin: roleName === "ADMIN",
      });

      // Admin has access to everything
      if (roleName === "ADMIN") {
        console.log("✅ Admin access granted");
        return NextResponse.next();
      }

      // Check specific route permissions
      const requiredPermissions = Object.entries(adminRoutes)
        .filter(([route]) => pathname.startsWith(route))
        .flatMap(([, permissions]) => permissions);

      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some((permission: string) =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } else {
        // For admin routes without specific permissions, require at least role:read
        if (!userPermissions.includes("role:read")) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
