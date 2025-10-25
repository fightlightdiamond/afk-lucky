"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Download } from "lucide-react";
import { generateTTS, TTSResponse } from "@/lib/aiapi";

interface TTSPlayerProps {
  text: string;
  autoGenerate?: boolean;
  useFileMode?: boolean; // Use file-based approach instead of base64
  className?: string;
}

export function TTSPlayer({
  text,
  autoGenerate = false,
  useFileMode = false,
  className = "",
}: TTSPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<TTSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (autoGenerate && text && !audioData) {
      handleGenerateTTS();
    }
  }, [text, autoGenerate, audioData, handleGenerateTTS]);

  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setError("Không có văn bản để chuyển đổi");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateTTS(text, "base64");

      if (response.error) {
        setError(response.error);
        return;
      }

      setAudioData(response);

      // Create audio element
      if (response.audio_base64) {
        const audioBlob = new Blob(
          [
            Uint8Array.from(atob(response.audio_base64), (c) =>
              c.charCodeAt(0)
            ),
          ],
          { type: "audio/wav" }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        } else {
          audioRef.current = new Audio(audioUrl);
        }

        // Setup audio event listeners
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setError("Lỗi phát audio");
          setIsPlaying(false);
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tạo TTS");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioData?.audio_base64) return;

    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioData.audio_base64), (c) => c.charCodeAt(0))],
      { type: "audio/wav" }
    );

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "story_audio.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg ${className}`}
    >
      {!audioData ? (
        <Button
          onClick={handleGenerateTTS}
          disabled={isLoading || !text.trim()}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              Đang tạo audio...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Tạo Audio
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button onClick={handlePlayPause} variant="outline" size="sm">
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>

          <div className="text-sm text-gray-600">
            {audioData.duration.toFixed(1)}s
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 flex items-center">
          <VolumeX className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
