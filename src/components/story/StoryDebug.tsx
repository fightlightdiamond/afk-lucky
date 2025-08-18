"use client";

import { useState, useEffect } from "react";

export default function StoryDebug() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching stories from /api/stories...");
      const res = await fetch("/api/stories");
      console.log("📡 Response status:", res.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("📦 Raw response data:", data);
      console.log("📦 Data type:", typeof data);
      console.log("📦 Is array:", Array.isArray(data));
      console.log("📦 Data length:", data?.length);

      if (Array.isArray(data)) {
        setStories(data);
        console.log("✅ Stories set successfully:", data.length, "items");
      } else {
        console.error("❌ Expected array but got:", typeof data);
        setStories([]);
      }
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setError(err.message);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🔧 Story Debug Panel
        </h1>

        <div className="mb-6">
          <button
            onClick={fetchStories}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh Stories"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">🔄 Loading stories...</p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Debug Info:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Stories count:</strong> {stories.length}
            </li>
            <li>
              <strong>Loading:</strong> {loading ? "Yes" : "No"}
            </li>
            <li>
              <strong>Error:</strong> {error || "None"}
            </li>
            <li>
              <strong>Data type:</strong>{" "}
              {Array.isArray(stories) ? "Array" : typeof stories}
            </li>
          </ul>
        </div>

        {/* Stories Display */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📚 Stories ({stories.length})
          </h2>

          {stories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-lg mb-2">📭 No stories found</p>
              <p className="text-sm">
                Either no stories exist or there's an issue with the API
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story: any, index: number) => (
                <div
                  key={story.id || index}
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      ID: {story.id || "No ID"}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
                      {story.createdAt
                        ? new Date(story.createdAt).toLocaleString("vi-VN")
                        : "No date"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <strong className="text-gray-700">Prompt:</strong>
                    <p className="text-gray-600 italic">
                      "{story.prompt || "No prompt"}"
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-700">Content:</strong>
                    <div className="text-gray-800 text-sm mt-1 p-2 bg-gray-50 rounded whitespace-pre-line max-h-32 overflow-y-auto">
                      {story.content || "No content"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw Data Display */}
        <details className="mt-8">
          <summary className="cursor-pointer font-semibold text-gray-800 hover:text-blue-600">
            🔍 View Raw Data
          </summary>
          <pre className="mt-2 p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-64">
            {JSON.stringify(stories, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
