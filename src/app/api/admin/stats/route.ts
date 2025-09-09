import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";

// GET /api/admin/stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has admin access
    if (ability.cannot("read", "Role") && ability.cannot("manage", "Role")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get counts
    const [usersCount, rolesCount] = await Promise.all([
      prisma.user.count({
        where: {
          deleted_at: null, // Only count active users
        },
      }),
      prisma.role.count(),
    ]);

    const stats = {
      users: usersCount,
      roles: rolesCount,
      permissions: 26, // From AVAILABLE_PERMISSIONS
      analytics: 0, // TODO: Add real analytics count
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
