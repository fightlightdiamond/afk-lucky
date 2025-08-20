import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { createAbility } from '@/lib/ability';

// GET /api/admin/roles/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to read roles
    if (ability.cannot('read', 'Role')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const role = await prisma.role.findFirst({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!role) {
      return new NextResponse('Role not found', { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/admin/roles/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to update roles
    if (ability.cannot('update', 'Role')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { name, description, permissions } = await request.json();

    if (!name || !Array.isArray(permissions)) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
        name,
        description,
        permissions: {
          set: permissions,
        },
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/admin/roles/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ability = createAbility(session);

    // Check if user has permission to delete roles
    if (ability.cannot('delete', 'Role')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if role is being used by any users
    const usersWithRole = await prisma.user.count({
      where: { role_id: params.id },
    });

    if (usersWithRole > 0) {
      return new NextResponse(
        'Cannot delete role that is assigned to users',
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
