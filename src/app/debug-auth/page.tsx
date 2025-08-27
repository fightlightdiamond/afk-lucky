"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch("/api/admin/users?page=1&pageSize=5");
        const data = await response.json();

        if (response.ok) {
          setApiTest(data);
        } else {
          setApiError(data);
        }
      } catch (error) {
        setApiError(error);
      }
    };

    if (status === "authenticated") {
      testApi();
    }
  }, [status]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session Status:</h2>
          <div className="text-sm space-y-1">
            <p>Status: {status}</p>
            <p>User: {session?.user?.email || "None"}</p>
            <p>Role: {(session?.user as any)?.role || "None"}</p>
          </div>
        </div>

        {session && (
          <div className="bg-blue-100 border border-blue-300 p-4 rounded">
            <h2 className="font-semibold text-blue-800 mb-2">Session Data:</h2>
            <pre className="text-xs bg-white p-2 rounded max-h-96 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        {apiError && (
          <div className="bg-red-100 border border-red-300 p-4 rounded">
            <h2 className="font-semibold text-red-800 mb-2">API Error:</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {JSON.stringify(apiError, null, 2)}
            </pre>
          </div>
        )}

        {apiTest && (
          <div className="bg-green-100 border border-green-300 p-4 rounded">
            <h2 className="font-semibold text-green-800 mb-2">
              API Test Success:
            </h2>
            <div className="text-sm space-y-2">
              <p>Users Count: {apiTest.users?.length || 0}</p>
              <p>Total: {apiTest.pagination?.total || 0}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">
                Raw API Response
              </summary>
              <pre className="text-xs bg-white p-2 rounded mt-2 max-h-96 overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
