"use client";

import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";

export default function DebugUseUsersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, error, isError } = useUsers(filters);

  console.log("DebugUseUsers - Raw Query Result:", {
    data,
    isLoading,
    error,
    isError,
    filters,
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug useUsers Hook</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Query State:</h2>
          <div className="text-sm space-y-1">
            <p>Loading: {isLoading ? "Yes" : "No"}</p>
            <p>Error: {isError ? "Yes" : "No"}</p>
            <p>Data: {data ? "Present" : "Null"}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 p-4 rounded">
            <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {data && (
          <div className="bg-green-100 border border-green-300 p-4 rounded">
            <h2 className="font-semibold text-green-800 mb-2">
              Success - Data Structure:
            </h2>
            <div className="text-sm space-y-2">
              <p>Users Count: {data.users?.length || 0}</p>
              <p>Total: {data.pagination?.total || 0}</p>
              <p>Current Page: {data.pagination?.page || 0}</p>
              <p>Page Size: {data.pagination?.pageSize || 0}</p>
              <p>Total Pages: {data.pagination?.totalPages || 0}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">
                Raw Data (Click to expand)
              </summary>
              <pre className="text-xs bg-white p-2 rounded mt-2 max-h-96 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-blue-100 border border-blue-300 p-4 rounded">
          <h2 className="font-semibold text-blue-800 mb-2">Test Controls:</h2>
          <div className="space-y-2">
            <button
              onClick={() => setFilters({ page: 1, pageSize: 5 })}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
            >
              Page 1, Size 5
            </button>
            <button
              onClick={() => setFilters({ page: 2, pageSize: 10 })}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
            >
              Page 2, Size 10
            </button>
            <button
              onClick={() =>
                setFilters({ page: 1, pageSize: 10, search: "admin" })
              }
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
            >
              Search "admin"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
