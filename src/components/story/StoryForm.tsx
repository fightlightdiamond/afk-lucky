"use client";

import { useState, useEffect } from "react";
import StoryLoadingStages from "./StoryLoadingStages";
import MagicalLoader from "./MagicalLoader";
import SmartProgressLoader from "./SmartProgressLoader";
import InteractiveLoader from "./InteractiveLoader";
import MarkdownRenderer from "../MarkdownRenderer";

export default function StoryForm() {
  const [prompt, setPrompt] = useState("Tạo giúp tôi 1 truyện chêm về IT");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingStyle, setLoadingStyle] = useState<
    "stages" | "magical" | "smart" | "interactive"
  >("interactive");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStory("");

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.content) {
        setStory(data.content);
        fetchHistory();
      } else {
        setStory("Không tạo được nội dung.");
      }
    } catch (err) {
      setStory("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      console.log("🔍 Fetching stories from /api/stories...");
      const res = await fetch("/api/stories");
      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("📦 Fetched stories data:", data);
      console.log(
        "📦 Data type:",
        typeof data,
        "Is array:",
        Array.isArray(data)
      );

      if (Array.isArray(data)) {
        setHistory(data);
        console.log("✅ History updated with", data.length, "stories");
      } else {
        console.error("❌ Expected array but got:", typeof data, data);
        setHistory([]);
      }
    } catch (error) {
      console.error("❌ Error fetching stories:", error);
      setHistory([]);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      {/* Loading overlays */}
      {loadingStyle === "stages" && (
        <StoryLoadingStages
          isLoading={loading}
          onComplete={() => {
            // This will be called when all stages complete
            // The actual API call completion will still control the loading state
          }}
        />
      )}

      {loadingStyle === "magical" && (
        <MagicalLoader
          isLoading={loading}
          loadingText="Đang tạo truyện kỳ diệu..."
        />
      )}

      {loadingStyle === "smart" && (
        <SmartProgressLoader
          isLoading={loading}
          estimatedTime={45}
          onComplete={() => {
            // Called when progress reaches 100%
          }}
        />
      )}

      {loadingStyle === "interactive" && (
        <InteractiveLoader
          isLoading={loading}
          onComplete={() => {
            // Called when interaction is complete
          }}
        />
      )}

      <div className="max-w-2xl mx-auto p-6">
        {/* Loading style selector */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-3">
            🎨 Chọn kiểu loading:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLoadingStyle("interactive")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                loadingStyle === "interactive"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              🎮 Interactive
            </button>
            <button
              type="button"
              onClick={() => setLoadingStyle("smart")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                loadingStyle === "smart"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              🧠 Smart Progress
            </button>
            <button
              type="button"
              onClick={() => setLoadingStyle("magical")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                loadingStyle === "magical"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              ✨ Magical
            </button>
            <button
              type="button"
              onClick={() => setLoadingStyle("stages")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                loadingStyle === "stages"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              📋 Stages
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full border-2 border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Nhập ý tưởng truyện của bạn..."
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tạo truyện...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                ✨ Tạo truyện kỳ diệu
              </span>
            )}
          </button>
        </form>

        {story && (
          <div className="mt-6 p-6 border-2 border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-2 rounded-full mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                ✨ Truyện của bạn đã sẵn sàng!
              </h3>
            </div>
            <div className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <MarkdownRenderer markdown={story} />
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📜 Lịch sử truyện</h2>
            <button
              onClick={fetchHistory}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              🔄 Làm mới
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-lg mb-2">📭 Chưa có truyện nào</p>
              <p className="text-sm">Hãy tạo truyện đầu tiên của bạn!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((s) => (
                <li
                  key={s.id}
                  className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600 font-medium">
                      Prompt:{" "}
                      <span className="italic font-normal">"{s.prompt}"</span>
                    </p>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(s.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-gray-800 text-sm leading-relaxed">
                    <MarkdownRenderer markdown={s.content} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
