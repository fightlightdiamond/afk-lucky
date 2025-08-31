"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugRolesPage() {
  const { data: session, status } = useSession();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRolesAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/roles");
      const data = await response.json();
      setApiResponse({
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      setApiResponse({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Debug Roles API</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({ status, session }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testRolesAPI} disabled={loading}>
            {loading ? "Testing..." : "Test Roles API"}
          </Button>

          {apiResponse && (
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
