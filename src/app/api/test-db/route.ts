import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();

    // Get a sample user
    const sampleUser = await prisma.user.findFirst({
      include: {
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      database: "connected",
      counts: {
        users: userCount,
        roles: roleCount,
      },
      sampleUser: sampleUser
        ? {
            id: sampleUser.id,
            email: sampleUser.email,
            first_name: sampleUser.first_name,
            last_name: sampleUser.last_name,
            role: sampleUser.role?.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
