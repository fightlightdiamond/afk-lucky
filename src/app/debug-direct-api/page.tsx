"use client";

import { useState } from "react";
import { userApi } from "@/lib/api";

export default function DebugDirectApiPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Calling userApi.getUsers directly...");
      const data = await userApi.getUsers({ page: 1, pageSize: 5 });
      console.log("Direct API call success:", data);
      setResult(data);
    } catch (err) {
      console.error("Direct API call error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testFetchDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Calling fetch directly...");
      const response = await fetch("/api/admin/users?page=1&pageSize=5");
      const data = await response.json();

      if (response.ok) {
        console.log("Direct fetch success:", data);
        setResult(data);
      } else {
        console.error("Direct fetch error:", data);
        setError(data);
      }
    } catch (err) {
      console.error("Direct fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Direct API Calls</h1>

      <div className="space-y-4">
        <div className="space-x-4">
          <button
            onClick={testDirectApi}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Test userApi.getUsers()"}
          </button>

          <button
            onClick={testFetchDirect}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Test fetch() directly"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 p-4 rounded">
            <h2 className="font-semibold text-red-800 mb-2">Error:</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-300 p-4 rounded">
            <h2 className="font-semibold text-green-800 mb-2">Success:</h2>
            <div className="text-sm space-y-2">
              <p>Users Count: {result.users?.length || 0}</p>
              <p>Total: {result.pagination?.total || 0}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">
                Raw Response
              </summary>
              <pre className="text-xs bg-white p-2 rounded mt-2 max-h-96 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
