"use client";

import { useState } from "react";
import { useStories, useCreateStory } from "@/hooks/useStories";
import type { Story } from "@/types/story";
import { Loader2, RefreshCw } from "lucide-react";

export default function StoryFormOptimized() {
  const [prompt, setPrompt] = useState("Tạo giúp tôi 1 truyện chêm về IT");
  const [currentStory, setCurrentStory] = useState("");

  // React Query hooks
  const {
    data: stories = [],
    isLoading: storiesLoading,
    error: storiesError,
    refetch,
  } = useStories();
  const createStoryMutation = useCreateStory();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentStory("");

    try {
      const result = await createStoryMutation.mutateAsync(prompt);
      if (result.content) {
        setCurrentStory(result.content);
      } else {
        setCurrentStory("Không tạo được nội dung.");
      }
    } catch {
      setCurrentStory("Đã xảy ra lỗi khi tạo truyện.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Nhập prompt để tạo truyện..."
          disabled={createStoryMutation.isPending}
        />
        <button
          type="submit"
          disabled={createStoryMutation.isPending || !prompt.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {createStoryMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo truyện"
          )}
        </button>
      </form>

      {/* Current generated story */}
      {currentStory && (
        <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">
            ✨ Truyện vừa tạo:
          </h3>
          <div className="whitespace-pre-line text-gray-700">
            {currentStory}
          </div>
        </div>
      )}

      {/* Stories history */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📜 Lịch sử truyện</h2>
          <button
            onClick={() => refetch()}
            disabled={storiesLoading}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${storiesLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>

        {storiesError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            Lỗi khi tải lịch sử: {storiesError.message}
          </div>
        )}

        {storiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải lịch sử...</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có truyện nào được tạo.</p>
            <p className="text-sm">Hãy tạo truyện đầu tiên của bạn!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {stories.map((story: Story) => (
              <li
                key={story.id}
                className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Prompt:{" "}
                    <span className="italic font-normal">&quot;{story.prompt}&quot;</span>
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(story.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="whitespace-pre-line text-gray-800 text-sm leading-relaxed">
                  {story.content}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
