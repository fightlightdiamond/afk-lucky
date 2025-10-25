import StoryWithTTS from "@/components/story/StoryWithTTS";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";

export default function StoryWithAudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-6 w-6" />
            <span className="font-semibold text-lg">
              Story Generator with Audio
            </span>
            <span className="px-2 py-1 bg-white/20 rounded text-sm">
              TTS Enabled
            </span>
          </div>
          <Link
            href="/story"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Simple
          </Link>
        </div>
      </div>

      <div className="container mx-auto py-8 px-6 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎵 Tạo Truyện với Audio
          </h1>
          <p className="text-gray-600">
            Tạo truyện và tự động chuyển đổi thành giọng nói tiếng Việt
          </p>
        </div>

        <StoryWithTTS />

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              📝 Base64 Mode
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Audio trong JSON response</li>
              <li>✅ Phản hồi nhanh, 1 request</li>
              <li>✅ Không cần lưu file</li>
              <li>⚠️ Phù hợp audio ngắn (&lt;30s)</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              📁 File Mode
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ File lưu trên server</li>
              <li>✅ Có thể cache và share URL</li>
              <li>✅ Phù hợp audio dài (&gt;30s)</li>
              <li>⚠️ Cần quản lý file storage</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">🎯 Tính năng</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-purple-600 mb-1">
                🎤 TTS Engine
              </div>
              <div className="text-gray-600">Facebook MMS-TTS Vietnamese</div>
            </div>
            <div>
              <div className="font-medium text-purple-600 mb-1">
                🔊 Audio Format
              </div>
              <div className="text-gray-600">WAV, 16kHz sampling rate</div>
            </div>
            <div>
              <div className="font-medium text-purple-600 mb-1">
                ⚡ Performance
              </div>
              <div className="text-gray-600">2-5s generation time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
