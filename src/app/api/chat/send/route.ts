import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const io = (globalThis as any).io || ((req as any).socket?.server?.io);
    if (io) {
      io.emit("message", message);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
