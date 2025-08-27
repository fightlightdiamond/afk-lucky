import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import { UserManagementErrorCodes } from "@/types/user";

// GET /api/admin/users/check-email - Check if email is available
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({
          error: "Authentication required",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const ability = createAbility(session);

    // Check if user has permission to create or update users
    if (ability.cannot("create", "User") && ability.cannot("update", "User")) {
      return new NextResponse(
        JSON.stringify({
          error: "Insufficient permissions",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const excludeUserId = searchParams.get("excludeUserId"); // For editing existing users

    if (!email) {
      return new NextResponse(
        JSON.stringify({
          error: "Email parameter is required",
          code: UserManagementErrorCodes.VALIDATION_ERROR,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse(
        JSON.stringify({
          available: false,
          error: "Invalid email format",
          code: UserManagementErrorCodes.INVALID_EMAIL_FORMAT,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email exists (case-insensitive)
    const whereClause: any = {
      email: {
        equals: email.toLowerCase().trim(),
        mode: "insensitive",
      },
    };

    // Exclude current user when editing
    if (excludeUserId) {
      whereClause.id = {
        not: excludeUserId,
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause,
      select: { id: true },
    });

    const available = !existingUser;

    return new NextResponse(
      JSON.stringify({
        available,
        email: email.toLowerCase().trim(),
        message: available ? "Email is available" : "Email is already taken",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error checking email availability:", error);

    return new NextResponse(
      JSON.stringify({
        error: "Failed to check email availability",
        code: UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
