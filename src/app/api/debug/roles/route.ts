import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 Debug: Testing database connection...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Count roles
    const roleCount = await prisma.role.count();
    console.log("📊 Role count:", roleCount);

    // Get all roles
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { users: true },
        },
      },
    });

    console.log(
      "📋 Roles found:",
      roles.map((r) => ({
        name: r.name,
        permissionCount: r.permissions.length,
      }))
    );

    return NextResponse.json({
      success: true,
      roleCount,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        createdAt: role.created_at.toISOString(),
        updatedAt: role.updated_at.toISOString(),
        _count: role._count,
      })),
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
