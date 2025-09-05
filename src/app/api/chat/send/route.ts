import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, groupId, content } = await req.json();

  if (!content || (!conversationId && !groupId)) {
    return NextResponse.json(
      { error: "conversationId or groupId and content are required" },
      { status: 400 }
    );
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        group_id: groupId,
        senderId: session.user.id,
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
