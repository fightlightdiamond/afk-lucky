"use client";

import { useState } from "react";
import { HybridTTSToggle } from "@/components/story/HybridTTSToggle";
import { useGenerateTTS, useTTSStatus } from "@/hooks/useTTS";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Download } from "lucide-react";

const EXAMPLE_TEXTS = [
  {
    label: "Mixed Vietnamese-English",
    text: "Xin chào, tôi tên là John và tôi học Machine Learning tại Vietnam.",
  },
  {
    label: "Technical Terms",
    text: "Hôm nay tôi học về Artificial Intelligence và Deep Learning.",
  },
  {
    label: "Food & Places",
    text: "Tôi thích ăn pizza và hamburger ở restaurant gần nhà.",
  },
  {
    label: "Pure Vietnamese",
    text: "Xin chào, tôi tên là Minh và tôi đến từ Hà Nội.",
  },
  {
    label: "English with Vietnamese names",
    text: "Hello, my name is Minh and I live in Hanoi, Vietnam.",
  },
];

export default function HybridTTSDemo() {
  const [text, setText] = useState(EXAMPLE_TEXTS[0].text);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  const { data: status } = useTTSStatus();
  const generateTTS = useGenerateTTS();

  const handleGenerate = async () => {
    const result = await generateTTS.mutateAsync({
      text,
      format: "base64",
    });

    if (result.audio_base64) {
      // Clean up old audio
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }

      // Create new audio
      const audioBlob = new Blob(
        [Uint8Array.from(atob(result.audio_base64), (c) => c.charCodeAt(0))],
        { type: "audio/wav" }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const audio = new Audio(url);
      setAudioElement(audio);
    }
  };

  const handlePlay = () => {
    if (audioElement) {
      audioElement.play();
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "hybrid-tts-demo.wav";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hybrid TTS Demo</h1>
        <p className="text-muted-foreground">
          Test Vietnamese-English hybrid text-to-speech with different modes
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>TTS Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Available:</span>{" "}
                <span
                  className={
                    status.available ? "text-green-600" : "text-red-600"
                  }
                >
                  {status.available ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Hybrid Mode:</span>{" "}
                <span
                  className={
                    status.hybrid_mode ? "text-blue-600" : "text-gray-600"
                  }
                >
                  {status.hybrid_mode ? "✓ Enabled" : "✗ Disabled"}
                </span>
              </div>
              <div>
                <span className="font-medium">Vietnamese Model:</span>{" "}
                <span className="text-xs text-muted-foreground">
                  {status.vi_model}
                </span>
              </div>
              <div>
                <span className="font-medium">English Model:</span>{" "}
                <span
                  className={
                    status.en_model_loaded ? "text-green-600" : "text-amber-600"
                  }
                >
                  {status.en_model_loaded ? "✓ Loaded" : "✗ Not loaded"}
                </span>
              </div>
            </div>
          )}

          <HybridTTSToggle />
        </CardContent>
      </Card>

      {/* Text Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Example Texts:</label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TEXTS.map((example) => (
                <Button
                  key={example.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setText(example.text)}
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Text:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter Vietnamese-English mixed text..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!text.trim() || generateTTS.isPending}
            className="w-full"
          >
            {generateTTS.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Audio"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Player Card */}
      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <audio src={audioUrl} controls className="w-full" />

            <div className="flex gap-2">
              <Button onClick={handlePlay} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Hybrid Mode ON:</strong> Automatically detects English words
            and uses the English TTS model for better pronunciation.
          </p>
          <p>
            <strong>Hybrid Mode OFF:</strong> Uses only Vietnamese TTS model
            (faster but English words sound Vietnamese).
          </p>
          <p>
            <strong>Tip:</strong> Toggle hybrid mode and compare the audio
            quality with mixed-language texts!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
