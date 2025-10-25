"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TTSPlayer } from "@/components/story/TTSPlayer";
import { TTSPlayerFile } from "@/components/story/TTSPlayerFile";
import { useTTSStatus, useGenerateStoryWithTTS } from "@/hooks/useTTS";
import { StoryWithTTSRequest } from "@/lib/aiapi";

export default function TTSTestPage() {
  const [testText, setTestText] = useState(
    "Xin chào anh em đến với bài tập của khoá AI Application Engineer"
  );
  const [storyPrompt, setStoryPrompt] = useState(
    "Kể một câu chuyện ngắn về một chú mèo thông minh"
  );

  const { data: ttsStatus, isLoading: statusLoading } = useTTSStatus();
  const {
    mutate: generateStoryWithTTS,
    isPending: storyLoading,
    data: storyResult,
  } = useGenerateStoryWithTTS();

  const handleGenerateStoryWithTTS = () => {
    const request: StoryWithTTSRequest = {
      prompt: storyPrompt,
      generate_audio: true,
      audio_format: "base64",
      preferences: {
        length: "short",
        language_mix: {
          ratio: 80,
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

    generateStoryWithTTS(request);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Text-to-Speech Demo</h1>
        <p className="text-gray-600">
          Test TTS functionality with Vietnamese text
        </p>
      </div>

      {/* TTS Status */}
      <Card>
        <CardHeader>
          <CardTitle>TTS Service Status</CardTitle>
          <CardDescription>
            Current status of the Text-to-Speech service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Checking status...
            </div>
          ) : ttsStatus ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={ttsStatus.available ? "default" : "destructive"}
                >
                  {ttsStatus.available ? "Available" : "Unavailable"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Model: {ttsStatus.model}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Supported formats: {ttsStatus.supported_formats.join(", ")}
              </div>
            </div>
          ) : (
            <Badge variant="destructive">Failed to load status</Badge>
          )}
        </CardContent>
      </Card>

      {/* Simple TTS Test */}
      <Card>
        <CardHeader>
          <CardTitle>Simple TTS Test</CardTitle>
          <CardDescription>
            Test TTS with custom text - Base64 vs File approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter Vietnamese text to convert to speech..."
            rows={3}
          />

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Base64 Approach (Original)
              </h4>
              <TTSPlayer text={testText} />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                File-based Approach (New)
              </h4>
              <TTSPlayerFile text={testText} mode="file" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story with TTS Test */}
      <Card>
        <CardHeader>
          <CardTitle>Story Generation with TTS</CardTitle>
          <CardDescription>
            Generate a story and create audio automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="Enter story prompt..."
            rows={2}
          />

          <Button
            onClick={handleGenerateStoryWithTTS}
            disabled={storyLoading || !storyPrompt.trim()}
            className="w-full"
          >
            {storyLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Story with Audio...
              </>
            ) : (
              "Generate Story with TTS"
            )}
          </Button>

          {storyResult && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {storyResult.title}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{storyResult.content}</p>
                </div>
              </div>

              {storyResult.metadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium">Word Count</div>
                    <div className="text-blue-600">
                      {storyResult.metadata.word_count}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium">Generation Time</div>
                    <div className="text-green-600">
                      {storyResult.metadata.generation_time}ms
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="font-medium">Language Mix</div>
                    <div className="text-purple-600">
                      VI: {storyResult.metadata.language_ratio.vi}% / EN:{" "}
                      {storyResult.metadata.language_ratio.en}%
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="font-medium">Readability</div>
                    <div className="text-orange-600">
                      {storyResult.metadata.readability_score}
                    </div>
                  </div>
                </div>
              )}

              {storyResult.audio && (
                <div>
                  <h4 className="font-medium mb-2">Generated Audio</h4>
                  {storyResult.audio.error ? (
                    <div className="text-red-600 text-sm">
                      Audio Error: {storyResult.audio.error}
                    </div>
                  ) : (
                    <TTSPlayer
                      text={storyResult.content}
                      autoGenerate={false}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Texts */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Texts</CardTitle>
          <CardDescription>
            Click to test different Vietnamese texts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              "Chào mừng bạn đến với ứng dụng Text-to-Speech của chúng tôi!",
              "Hôm nay là một ngày đẹp trời để học tiếng Anh.",
              "Công nghệ AI đang phát triển rất nhanh chóng.",
              "Tôi yêu Việt Nam và muốn học thêm về văn hóa truyền thống.",
              "Machine Learning và Deep Learning là hai lĩnh vực rất thú vị.",
            ].map((text, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3"
                onClick={() => setTestText(text)}
              >
                {text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
