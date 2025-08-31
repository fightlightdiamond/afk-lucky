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

// Define UserRole enum since it's not available from @prisma/client
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  AUTHOR = "AUTHOR",
  EDITOR = "EDITOR",
  MODERATOR = "MODERATOR",
}

interface RoleWithCount {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
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
      userRole: session?.user?.role,
      userPermissions: session?.user?.role?.permissions,
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

    const roles = (await prisma.role.findMany({
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
      orderBy: {
        name: "asc",
      },
    })) as unknown as RoleWithCount[];

    // For GET requests, return just the roles array (not wrapped in an object)
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
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
