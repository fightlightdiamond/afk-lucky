import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const SendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  conversationId: z.string().optional(),
  groupId: z.coerce.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, groupId, content } = SendMessageSchema.parse(await req.json());

  // XOR: exactly one target
  if (!((!!conversationId) !== (!!groupId))) {
    return NextResponse.json(
      { error: "Provide content and exactly one of conversationId or groupId" },
      { status: 400 }
    );
  }

  // ...rest of handler...
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
