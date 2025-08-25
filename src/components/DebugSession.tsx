"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugSession() {
  const { data: session, status } = useSession();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🐛 Debug Session</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>

          <div>
            <strong>Session Data:</strong>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-2 overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          {session?.user?.role && (
            <div>
              <strong>User Role:</strong>
              <pre className="bg-blue-100 dark:bg-blue-900 p-4 rounded mt-2 overflow-auto text-sm">
                {JSON.stringify(session.user.role, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
