"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryAudioPlayerProps {
  audioUrl?: string | null;
  storyContent: string;
  storyId?: string; // For polling audio URL from DB
  autoGenerate?: boolean;
}

export default function StoryAudioPlayer({
  audioUrl,
  storyContent,
  autoGenerate = false,
}: StoryAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedGeneration = useRef(false);

  useEffect(() => {
    if (audioUrl) {
      // Convert relative URL to full URL
      const fullUrl = audioUrl.startsWith("http")
        ? audioUrl
        : `http://localhost:8000${audioUrl}`;
      setCurrentAudioUrl(fullUrl);

      // Setup audio element
      if (audioRef.current) {
        audioRef.current.src = fullUrl;
      } else {
        audioRef.current = new Audio(fullUrl);
      }
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setError("Lỗi phát audio");
        setIsPlaying(false);
      };
    }
  }, [audioUrl]);

  const handleGenerateAudio = useCallback(async () => {
    if (!storyContent.trim()) {
      setError("Không có nội dung để tạo audio");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/tts/generate-file",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: storyContent,
            output_format: "file",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.file_url) {
        const fullUrl = `http://localhost:8000${data.file_url}`;
        setCurrentAudioUrl(fullUrl);

        // Create audio element
        if (audioRef.current) {
          audioRef.current.src = fullUrl;
        } else {
          audioRef.current = new Audio(fullUrl);
        }

        // Setup event listeners
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setError("Lỗi phát audio");
          setIsPlaying(false);
        };
      }
    } catch (err) {
      console.error("TTS generation error:", err);
      setError(err instanceof Error ? err.message : "Lỗi tạo audio");
    } finally {
      setIsGenerating(false);
    }
  }, [storyContent]);

  useEffect(() => {
    if (
      autoGenerate &&
      !currentAudioUrl &&
      storyContent &&
      !isGenerating &&
      !hasAttemptedGeneration.current
    ) {
      hasAttemptedGeneration.current = true;
      handleGenerateAudio();
    }
  }, [
    autoGenerate,
    currentAudioUrl,
    storyContent,
    isGenerating,
    handleGenerateAudio,
  ]);

  const handlePlayPause = () => {
    if (!audioRef.current) {
      if (currentAudioUrl) {
        audioRef.current = new Audio(currentAudioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setError("Lỗi phát audio");
          setIsPlaying(false);
        };
      } else {
        return;
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!currentAudioUrl) return;

    const link = document.createElement("a");
    link.href = currentAudioUrl;
    link.download = "story_audio.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If generating, show loading
  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700">Đang tạo audio từ AI...</span>
      </div>
    );
  }

  // If no audio URL, show generate button
  if (!currentAudioUrl) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
        <Button
          onClick={handleGenerateAudio}
          disabled={isGenerating || !storyContent.trim()}
          variant="outline"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo audio...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Tạo Audio
            </>
          )}
        </Button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }

  // If has audio, show player
  if (currentAudioUrl) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <Button
          onClick={handlePlayPause}
          variant="outline"
          size="sm"
          className="bg-white"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="bg-white"
        >
          <Download className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 text-sm text-green-700">
          <Volume2 className="h-4 w-4" />
          <span>Audio từ AI</span>
        </div>

        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }

  return null;
}
