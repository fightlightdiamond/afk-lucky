import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateTTS,
  generateStoryWithTTS,
  aiApiClient,
  TTSResponse,
  StoryWithTTSRequest,
  StoryWithTTSResponse,
} from "@/lib/aiapi";

// TTS Status Hook
export function useTTSStatus() {
  return useQuery({
    queryKey: ["tts-status"],
    queryFn: () => aiApiClient.getTTSStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// TTS Generation Hook
export function useGenerateTTS() {
  return useMutation({
    mutationFn: ({
      text,
      format = "base64",
    }: {
      text: string;
      format?: "wav" | "base64" | "bytes";
    }) => generateTTS(text, format),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`TTS Error: ${data.error}`);
      } else {
        toast.success(
          `Audio generated successfully! Duration: ${data.duration.toFixed(1)}s`
        );
      }
    },
    onError: (error: any) => {
      console.error("TTS generation failed:", error);
      toast.error(
        error.message || "Failed to generate audio. Please try again."
      );
    },
  });
}

// Story with TTS Generation Hook
export function useGenerateStoryWithTTS() {
  return useMutation({
    mutationFn: (request: StoryWithTTSRequest) => generateStoryWithTTS(request),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`Story Error: ${data.error}`);
        return;
      }

      let message = "Story generated successfully! 🎉";

      if (data.audio) {
        if (data.audio.error) {
          message += ` (Audio: ${data.audio.error})`;
        } else {
          message += ` Audio: ${data.audio.duration.toFixed(1)}s`;
        }
      }

      toast.success(message);

      // Log generation metadata
      if (data.metadata) {
        console.log("Story Generation Stats:", {
          wordCount: data.metadata.word_count,
          languageRatio: data.metadata.language_ratio,
          generationTime: `${data.metadata.generation_time}ms`,
          readabilityScore: data.metadata.readability_score,
        });
      }
    },
    onError: (error: any) => {
      console.error("Story with TTS generation failed:", error);
      toast.error(
        error.message ||
          "Failed to generate story with audio. Please try again."
      );
    },
  });
}

// Audio Player Hook
export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const loadAudio = useCallback(
    (audioData: TTSResponse) => {
      if (!audioData.audio_base64) return null;

      try {
        // Stop current audio if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        // Create new audio from base64
        const audioBlob = new Blob(
          [
            Uint8Array.from(atob(audioData.audio_base64), (c) =>
              c.charCodeAt(0)
            ),
          ],
          { type: "audio/wav" }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // Setup event listeners
        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
          setCurrentTime(audio.currentTime);
        });

        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio playback error:", e);
          toast.error("Audio playback failed");
          setIsPlaying(false);
        });

        setCurrentAudio(audio);
        return audio;
      } catch (error) {
        console.error("Error loading audio:", error);
        toast.error("Failed to load audio");
        return null;
      }
    },
    [currentAudio]
  );

  const play = useCallback(() => {
    if (currentAudio) {
      currentAudio.play();
      setIsPlaying(true);
    }
  }, [currentAudio]);

  const pause = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentAudio]);

  const seek = useCallback(
    (time: number) => {
      if (currentAudio) {
        currentAudio.currentTime = time;
        setCurrentTime(time);
      }
    },
    [currentAudio]
  );

  const downloadAudio = useCallback(
    (audioData: TTSResponse, filename = "audio.wav") => {
      if (!audioData.audio_base64) return;

      try {
        const audioBlob = new Blob(
          [
            Uint8Array.from(atob(audioData.audio_base64), (c) =>
              c.charCodeAt(0)
            ),
          ],
          { type: "audio/wav" }
        );

        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Audio downloaded successfully!");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download audio");
      }
    },
    []
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      setCurrentAudio(null);
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
    }
  }, [currentAudio]);

  return {
    isPlaying,
    duration,
    currentTime,
    loadAudio,
    play,
    pause,
    stop,
    seek,
    downloadAudio,
    cleanup,
  };
}
