"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Volume2 } from "lucide-react";
import { TTSPlayerFile } from "./TTSPlayerFile";
import { useGenerateStoryWithTTS } from "@/hooks/useTTS";
import type { StoryWithTTSRequest } from "@/lib/aiapi";

export default function StoryWithTTS() {
  const [prompt, setPrompt] = useState(
    "Kể một câu chuyện ngắn về một chú mèo thông minh"
  );
  const [enableAudio, setEnableAudio] = useState(true);
  const [audioMode, setAudioMode] = useState<"base64" | "file">("file");

  const {
    mutate: generateStory,
    isPending,
    data: storyResult,
  } = useGenerateStoryWithTTS();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    const request: StoryWithTTSRequest = {
      prompt: prompt.trim(),
      generate_audio: enableAudio,
      audio_format: audioMode,
      preferences: {
        length: "medium",
        language_mix: {
          ratio: 70,
          base_language: "vi",
          target_language: "en",
        },
        style: {
          storytelling: "narrative",
          tone: "friendly",
          readability_level: "intermediate",
        },
      },
    };

    generateStory(request);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Tạo Truyện với Audio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prompt truyện
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập ý tưởng truyện của bạn..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Audio Options */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableAudio"
                  checked={enableAudio}
                  onChange={(e) => setEnableAudio(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="enableAudio"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Tạo audio cho truyện
                </label>
              </div>

              {enableAudio && (
                <div className="ml-6 space-y-2">
                  <label className="text-sm text-gray-600">Audio format:</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={audioMode === "base64" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAudioMode("base64")}
                    >
                      Base64
                    </Button>
                    <Button
                      type="button"
                      variant={audioMode === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAudioMode("file")}
                    >
                      File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {audioMode === "base64"
                      ? "Audio sẽ được gửi trực tiếp trong response (phù hợp audio ngắn)"
                      : "Audio sẽ được lưu file trên server (phù hợp audio dài, có thể cache)"}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || !prompt.trim()}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo truyện{enableAudio ? " và audio" : ""}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo Truyện{enableAudio ? " + Audio" : ""}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {storyResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{storyResult.title}</CardTitle>
              <div className="flex gap-2">
                {storyResult.metadata && (
                  <>
                    <Badge variant="secondary">
                      {storyResult.metadata.word_count} từ
                    </Badge>
                    <Badge variant="secondary">
                      {storyResult.metadata.generation_time}ms
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Story Content */}
            <div className="prose max-w-none">
              <div className="bg-white p-6 rounded-lg border">
                <p className="whitespace-pre-wrap text-gray-700">
                  {storyResult.content}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {storyResult.metadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Số từ</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {storyResult.metadata.word_count}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Thời gian tạo</div>
                  <div className="text-lg font-semibold text-green-600">
                    {storyResult.metadata.generation_time}ms
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Tỷ lệ ngôn ngữ</div>
                  <div className="text-sm font-semibold text-purple-600">
                    VI: {storyResult.metadata.language_ratio.vi}% / EN:{" "}
                    {storyResult.metadata.language_ratio.en}%
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Độ dễ đọc</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {storyResult.metadata.readability_score}
                  </div>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {storyResult.audio && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio của truyện
                </h4>

                {storyResult.audio.error ? (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    ❌ {storyResult.audio.error}
                  </div>
                ) : storyResult.audio.file_url ? (
                  <div className="space-y-2">
                    <TTSPlayerFile text={storyResult.content} mode="file" />
                    <div className="text-xs text-gray-500">
                      File: {storyResult.audio.file_url}
                    </div>
                  </div>
                ) : (
                  <TTSPlayerFile text={storyResult.content} mode="base64" />
                )}
              </div>
            )}

            {/* Sections (if any) */}
            {storyResult.sections?.moral && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">💡 Bài học</h4>
                <p className="text-gray-700 italic">
                  {storyResult.sections.moral}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
