"use client";

import { useState } from "react";
import { testStoriesAPI } from "@/lib/test-stories-api";

export default function StoryAPITest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testStoriesAPI();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🧪 Stories API Test
        </h1>

        <button
          onClick={runTest}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 mb-6"
        >
          {testing ? "🔄 Testing..." : "🚀 Run API Test"}
        </button>

        {testResult && (
          <div
            className={`p-4 rounded-lg border ${
              testResult.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                testResult.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {testResult.success ? "✅ Test Passed" : "❌ Test Failed"}
            </h3>

            {testResult.success ? (
              <div className="text-green-700 text-sm space-y-1">
                <p>
                  <strong>Initial stories count:</strong>{" "}
                  {testResult.initialCount}
                </p>
                <p>
                  <strong>Final stories count:</strong> {testResult.finalCount}
                </p>
                <p>
                  <strong>New story created:</strong>{" "}
                  {testResult.newStory?.id ? "Yes" : "No"}
                </p>
                {testResult.newStory && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">View new story</summary>
                    <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.newStory, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {testResult.error}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Test Steps:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Fetch existing stories from GET /api/stories</li>
            <li>Create a new story via POST /api/story</li>
            <li>Fetch stories again to verify the new story was added</li>
            <li>Compare counts and validate response structure</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Debug Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Check browser console for detailed logs</li>
            <li>Verify database connection and Prisma setup</li>
            <li>Ensure API routes are properly configured</li>
            <li>Check if the Story model exists in your database</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
