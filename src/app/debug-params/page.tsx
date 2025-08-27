"use client";

import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";

export default function DebugParamsPage() {
  const [testParams, setTestParams] = useState({
    page: 1,
    pageSize: 5,
  });

  const { data, isLoading, error } = useUsers(testParams);

  const testWithRole = () => {
    setTestParams({
      page: 1,
      pageSize: 5,
      role: "USER", // This might be the problem - sending role name instead of ID
    });
  };

  const testWithRoleId = () => {
    setTestParams({
      page: 1,
      pageSize: 5,
      role: "b88621dc-160b-474d-9ba2-626b6d1e5b6b", // USER role ID from test data
    });
  };

  const testBasic = () => {
    setTestParams({
      page: 1,
      pageSize: 5,
    });
  };

  console.log("DebugParams - Current params:", testParams);
  console.log("DebugParams - Query result:", { data, isLoading, error });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Query Params</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Params:</h2>
          <pre className="text-sm">{JSON.stringify(testParams, null, 2)}</pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={testBasic}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Basic (No Role)
          </button>

          <button
            onClick={testWithRole}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Test with Role Name "USER" (Should Fail)
          </button>

          <button
            onClick={testWithRoleId}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Test with Role ID (Should Work)
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Query State:</h2>
          <div className="text-sm space-y-1">
            <p>Loading: {isLoading ? "Yes" : "No"}</p>
            <p>Error: {error ? "Yes" : "No"}</p>
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
            <h2 className="font-semibold text-green-800 mb-2">Success:</h2>
            <div className="text-sm space-y-2">
              <p>Users Count: {data.users?.length || 0}</p>
              <p>Total: {data.pagination?.total || 0}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">
                First User
              </summary>
              <pre className="text-xs bg-white p-2 rounded mt-2">
                {JSON.stringify(data.users?.[0], null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
