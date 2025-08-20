"use client";

import { DebugSession } from "@/components/DebugSession";

export default function DebugSessionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Session Debug</h1>
      <DebugSession />
    </div>
  );
}
