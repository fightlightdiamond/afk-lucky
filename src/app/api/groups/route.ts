import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, memberIds = [] } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const uniqueMemberIds = Array.from(new Set([session.user.id, ...memberIds]));

    // Block reassigning members already in another group
    const conflicts = await prisma.user.findMany({
      where: {
        id:    { in: uniqueMemberIds },
        group_id: { not: null }
      },
      select: {
        id:      true,
        group_id: true
      },
    });
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "Some members already belong to a group", conflicts },
        { status: 409 }
      );
    }

    const connectIds = uniqueMemberIds.map((id) => ({ id }));

    const group = await prisma.group.create({
      data: {
        name,
        users: { connect: connectIds },
      },
    });

    return NextResponse.json(group, { status: 201 });

    return NextResponse.json(group);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
