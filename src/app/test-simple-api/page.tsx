"use client";

import { useState, useEffect } from "react";

export default function TestSimpleApiPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSimpleCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing simple API call without filters...");
      const response = await fetch("/api/admin/users?page=1&pageSize=5");
      const data = await response.json();

      if (response.ok) {
        console.log("Simple API call success:", data);
        setResult(data);
      } else {
        console.error("Simple API call error:", data);
        setError(data);
      }
    } catch (err) {
      console.error("Simple API call error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testWithRoleFilter = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing API call with role filter...");
      const response = await fetch(
        "/api/admin/users?page=1&pageSize=5&role=USER"
      );
      const data = await response.json();

      if (response.ok) {
        console.log("Role filter API call success:", data);
        setResult(data);
      } else {
        console.error("Role filter API call error:", data);
        setError(data);
      }
    } catch (err) {
      console.error("Role filter API call error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-test on load
  useEffect(() => {
    testSimpleCall();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Simple API</h1>

      <div className="space-y-4">
        <div className="space-x-4">
          <button
            onClick={testSimpleCall}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Test Simple Call (No Filters)"}
          </button>

          <button
            onClick={testWithRoleFilter}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Test with Role Filter"}
          </button>
        </div>

        {loading && (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded">
            <p>Loading...</p>
          </div>
        )}

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
              <p>Current Page: {result.pagination?.page || 0}</p>
              <p>Page Size: {result.pagination?.pageSize || 0}</p>
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
