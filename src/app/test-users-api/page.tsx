"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestUsersApiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users?page=1&pageSize=10");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${
            result.error || response.statusText
          }`
        );
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Users API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApi} disabled={loading}>
            {loading ? "Testing..." : "Test API"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-800">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-green-700">API returned data successfully</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Response Summary:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Users count: {data.users?.length || 0}</li>
                  <li>Total records: {data.pagination?.total || 0}</li>
                  <li>Current page: {data.pagination?.page || "N/A"}</li>
                  <li>Page size: {data.pagination?.pageSize || "N/A"}</li>
                </ul>
              </div>

              <details className="border rounded-md p-4">
                <summary className="cursor-pointer font-semibold">
                  Raw Response Data
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
