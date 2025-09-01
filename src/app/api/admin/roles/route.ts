import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import {
  AVAILABLE_PERMISSIONS,
  validatePermissions,
  type Permission,
} from "@/services/permissionService";

// Import UserRole from Prisma generated types
import { UserRole } from "@prisma/client";

interface RoleWithCount {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
}

// GET /api/admin/roles
export async function GET(request: Request) {
  try {
    console.log("🔍 API /admin/roles - Getting session...");

    const session = await getServerSession(authOptions);
    console.log("🎫 API Session:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userPermissions: session?.user?.role?.permissions,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : [],
    });

    if (!session?.user) {
      console.log("❌ API: No session, returning 401");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);
    console.log("🛡️ API Ability check:", {
      canManageRole: ability.can("manage", "Role"),
      canReadRole: ability.can("read", "Role"),
    });

    // Only allow users with permission to manage roles to fetch them
    if (ability.cannot("manage", "Role") && ability.cannot("read", "Role")) {
      console.log("❌ API: No role permissions, returning 403");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const rolesData = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        created_at: true, // Use schema field name
        updated_at: true, // Use schema field name
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map database field names to frontend expected names
    const roles = rolesData.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.created_at.toISOString(), // Map to frontend format
      updatedAt: role.updated_at.toISOString(), // Map to frontend format
      _count: role._count,
    }));

    console.log("📊 API: Returning roles:", {
      count: roles.length,
      roleNames: roles.map((r) => r.name),
    });

    // Return roles wrapped in an object to match frontend expectations
    return NextResponse.json({ roles });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/admin/roles
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Only allow users with permission to create roles
    if (ability.cannot("create", "Role")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { name, description, permissions } = await request.json();

    if (!name || !Array.isArray(permissions)) {
      return new NextResponse("Name and permissions are required", {
        status: 400,
      });
    }

    // Validate permissions
    const { valid, invalid } = validatePermissions(permissions);

    if (invalid.length > 0) {
      return new NextResponse(
        JSON.stringify({ error: `Invalid permissions: ${invalid.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if role already exists (case-insensitive)
    const existingRole = await prisma.role.findFirst({
      where: {
        name: name,
      },
    });

    if (existingRole) {
      return new NextResponse(
        JSON.stringify({ error: "A role with this name already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newRole = await prisma.role.create({
      data: {
        name: name.toUpperCase(),
        description,
        permissions: {
          set: valid,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create role" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
