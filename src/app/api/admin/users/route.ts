import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";

// GET /api/admin/users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to read users
    if (ability.cannot("read", "User")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        created_at: true,
        last_login: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/admin/users
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to create users
    if (ability.cannot("create", "User")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { email, first_name, last_name, password, role_id, is_active } =
      await request.json();

    if (!email || !first_name || !last_name || !password) {
      return new NextResponse(
        JSON.stringify({
          error: "Email, first name, last name, and password are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "A user with this email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role if provided
    if (role_id) {
      const role = await prisma.role.findUnique({
        where: { id: role_id },
      });

      if (!role) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid role selected" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashedPassword,
        role_id: role_id || null,
        is_active: is_active ?? true,
        sex: true, // Default value
        coin: BigInt(1000), // Default value
        locale: "en", // Default value
        group_id: 1, // Default value
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        created_at: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create user" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
