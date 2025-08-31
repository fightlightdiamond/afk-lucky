import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🧪 Testing simple roles fetch...");

    // Test 1: Database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Test 2: Simple count
    const count = await prisma.role.count();
    console.log("✅ Role count:", count);

    // Test 3: Simple findMany
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: 3, // Limit to 3 for testing
    });
    console.log("✅ Simple roles:", roles);

    // Test 4: With permissions
    const rolesWithPermissions = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        permissions: true,
      },
      take: 2,
    });
    console.log("✅ Roles with permissions:", rolesWithPermissions);

    // Test 5: With dates
    const rolesWithDates = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
      take: 1,
    });
    console.log("✅ Roles with dates:", rolesWithDates);

    return NextResponse.json({
      success: true,
      tests: {
        count,
        simpleRoles: roles,
        rolesWithPermissions,
        rolesWithDates,
      },
    });
  } catch (error) {
    console.error("❌ Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
