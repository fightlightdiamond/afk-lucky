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

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      recentUsers,
      roleDistribution,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          deleted_at: null,
        },
      }),
      prisma.user.count({
        where: {
          deleted_at: null,
          is_active: true,
        },
      }),
      prisma.user.count({
        where: {
          deleted_at: null,
          is_active: false,
        },
      }),
      prisma.user.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role_id"],
        _count: {
          id: true,
        },
        where: {
          deleted_at: null,
        },
      }),
    ]);

    // Get recent activity (last 10 users)
    const recentActivity = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
      },
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
    });

    // Get role names for distribution
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const roleMap = new Map(roles.map((role) => [role.id, role.name]));

    const roleDistributionWithNames = roleDistribution.map((item) => ({
      role: roleMap.get(item.role_id) || "No Role",
      count: item._count.id,
    }));

    // Add users without roles
    const usersWithoutRoles =
      totalUsers -
      roleDistribution.reduce((sum, item) => sum + item._count.id, 0);
    if (usersWithoutRoles > 0) {
      roleDistributionWithNames.push({
        role: "No Role",
        count: usersWithoutRoles,
      });
    }

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        newThisMonth: recentUsers,
      },
      roleDistribution: roleDistributionWithNames,
      recentActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
