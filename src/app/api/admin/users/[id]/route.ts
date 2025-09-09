import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";

// GET /api/admin/users/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findFirst({
      where: { id: params.id },
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
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/admin/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to update users
    if (ability.cannot("update", "User")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { email, first_name, last_name, password, role_id, is_active } =
      await request.json();

    if (!email || !first_name || !last_name) {
      return new NextResponse(
        JSON.stringify({
          error: "Email, first name, and last name are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if email is already taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email,
        id: { not: params.id },
      },
    });

    if (emailTaken) {
      return new NextResponse(
        JSON.stringify({ error: "Email is already taken by another user" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    // Prepare update data
    const updateData: any = {
      email,
      first_name,
      last_name,
      role_id: role_id || null,
      is_active: is_active ?? true,
    };

    // Hash password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update user" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PATCH /api/admin/users/[id] - For partial updates like status toggle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to update users
    if (ability.cannot("update", "User")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updateData = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to delete users
    if (ability.cannot("delete", "User")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent deleting the current user
    if (params.id === session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "You cannot delete your own account" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
