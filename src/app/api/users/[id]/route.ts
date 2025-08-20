import { NextResponse } from "next/server";

// Placeholder handlers for single user operations until backend is implemented
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
