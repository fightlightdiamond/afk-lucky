"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
} from "lucide-react";
import { generateTTS, generateTTSFile, TTSResponse } from "@/lib/aiapi";

interface TTSPlayerFileProps {
  text: string;
  autoGenerate?: boolean;
  mode?: "base64" | "file"; // Choose between base64 and file mode
  className?: string;
}

export function TTSPlayerFile({
  text,
  autoGenerate = false,
  mode = "base64",
  className = "",
}: TTSPlayerFileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<TTSResponse | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (autoGenerate && text && !audioData && !fileData) {
      handleGenerateTTS();
    }
  }, [text, autoGenerate]);

  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setError("Không có văn bản để chuyển đổi");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "file") {
        // Use file-based approach
        const response = await generateTTSFile(text);

        if (response.error) {
          setError(response.error);
          return;
        }

        setFileData(response);

        // Create audio element with file URL
        const audioUrl = `http://localhost:8000${response.file_url}`;

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        } else {
          audioRef.current = new Audio(audioUrl);
        }

        // Setup audio event listeners
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setError("Lỗi phát audio từ file");
          setIsPlaying(false);
        };
      } else {
        // Use base64 approach
        const response = await generateTTS(text, "base64");

        if (response.error) {
          setError(response.error);
          return;
        }

        setAudioData(response);

        // Create audio element with base64 data
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
            setError("Lỗi phát audio từ base64");
            setIsPlaying(false);
          };
        }
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
    if (mode === "file" && fileData?.file_url) {
      // Download from file URL
      const link = document.createElement("a");
      link.href = `http://localhost:8000${fileData.file_url}`;
      link.download = "story_audio.wav";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (audioData?.audio_base64) {
      // Download from base64
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
    }
  };

  const openFileInNewTab = () => {
    if (mode === "file" && fileData?.file_url) {
      window.open(`http://localhost:8000${fileData.file_url}`, "_blank");
    }
  };

  const currentData = mode === "file" ? fileData : audioData;
  const hasAudio = currentData !== null;

  return (
    <div
      className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span
          className={`px-2 py-1 rounded ${
            mode === "file"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {mode === "file" ? "FILE" : "BASE64"}
        </span>
      </div>

      {!hasAudio ? (
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
              Tạo Audio ({mode})
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

          {mode === "file" && fileData?.file_url && (
            <Button
              onClick={openFileInNewTab}
              variant="outline"
              size="sm"
              title="Mở file trong tab mới"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}

          <div className="text-sm text-gray-600">
            {currentData.duration?.toFixed(1)}s
            {mode === "file" && fileData?.size_bytes && (
              <span className="ml-1">
                ({Math.round(fileData.size_bytes / 1024)}KB)
              </span>
            )}
          </div>

          {mode === "file" && fileData?.file_path && (
            <div className="text-xs text-gray-500 max-w-xs truncate">
              {fileData.file_path}
            </div>
          )}
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
