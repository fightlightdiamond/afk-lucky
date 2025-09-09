import { Server as SocketIOServer } from "socket.io";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const server = (req as any).socket?.server;
  if (!server) {
    return new Response("Socket server not found", { status: 500 });
  }
  if (!server.io) {
    server.io = new SocketIOServer(server, { path: "/api/socket" });
    (globalThis as any).io = server.io;
  }
  return new Response("Socket initialized", { status: 200 });
}
