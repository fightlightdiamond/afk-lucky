"use client";

import { useState } from "react";
import StoryLoadingStages from "./StoryLoadingStages";
import MagicalLoader from "./MagicalLoader";
import SmartProgressLoader from "./SmartProgressLoader";
import InteractiveLoader from "./InteractiveLoader";

type LoadingType = "stages" | "magical" | "smart" | "interactive";

const loadingTypes: Array<{
  id: LoadingType;
  name: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    id: "interactive",
    name: "Interactive Loading",
    description: "Tương tác với người dùng, có thể nhấp để thêm năng lượng",
    icon: "🎮",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "smart",
    name: "Smart Progress",
    description: "Thanh tiến trình thông minh với thống kê thời gian thực",
    icon: "🧠",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "magical",
    name: "Magical Loading",
    description: "Hiệu ứng ma thuật với particles và typing animation",
    icon: "✨",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "stages",
    name: "Loading Stages",
    description: "Hiển thị từng giai đoạn tạo truyện một cách chi tiết",
    icon: "📋",
    color: "from-green-500 to-teal-600",
  },
];

export default function LoadingShowcase() {
  const [activeLoader, setActiveLoader] = useState<LoadingType | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);

  const startDemo = (type: LoadingType) => {
    setActiveLoader(type);
    setDemoRunning(true);
  };

  const stopDemo = () => {
    setActiveLoader(null);
    setDemoRunning(false);
  };

  const runAllDemo = async () => {
    for (const type of loadingTypes) {
      setActiveLoader(type.id);
      setDemoRunning(true);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds each
    }
    stopDemo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Loading Components */}
      {activeLoader === "stages" && (
        <StoryLoadingStages isLoading={demoRunning} onComplete={stopDemo} />
      )}
      {activeLoader === "magical" && <MagicalLoader isLoading={demoRunning} />}
      {activeLoader === "smart" && (
        <SmartProgressLoader
          isLoading={demoRunning}
          estimatedTime={30}
          onComplete={stopDemo}
        />
      )}
      {activeLoader === "interactive" && (
        <InteractiveLoader isLoading={demoRunning} onComplete={stopDemo} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎨 Loading Experience Showcase
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Khám phá các kiểu loading độc đáo cho trải nghiệm tạo truyện
          </p>

          {/* Global controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={runAllDemo}
              disabled={demoRunning}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              🎬 Demo Tất Cả (20s)
            </button>

            {demoRunning && (
              <button
                onClick={stopDemo}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                ⏹️ Dừng Demo
              </button>
            )}
          </div>
        </div>

        {/* Loading Types Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {loadingTypes.map((type) => (
            <div
              key={type.id}
              className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                activeLoader === type.id
                  ? "ring-4 ring-purple-500 ring-opacity-50"
                  : ""
              }`}
            >
              {/* Card Background */}
              <div className={`bg-gradient-to-br ${type.color} p-8 text-white`}>
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{type.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{type.name}</h3>
                    <p className="text-white/80 text-sm">{type.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">✨ Tính năng:</h4>
                  <ul className="text-sm text-white/90 space-y-1">
                    {type.id === "interactive" && (
                      <>
                        <li>• Tương tác bằng cách nhấp chuột</li>
                        <li>• Động viên và fun facts</li>
                        <li>• Hiệu ứng trái tim bay</li>
                        <li>• Tùy chọn âm thanh</li>
                      </>
                    )}
                    {type.id === "smart" && (
                      <>
                        <li>• Thanh tiến trình thông minh</li>
                        <li>• Ước tính thời gian chính xác</li>
                        <li>• Thống kê thời gian thực</li>
                        <li>• Cảnh báo overtime</li>
                      </>
                    )}
                    {type.id === "magical" && (
                      <>
                        <li>• Hiệu ứng particles động</li>
                        <li>• Typing animation</li>
                        <li>• Gradient background</li>
                        <li>• Tips xoay vòng</li>
                      </>
                    )}
                    {type.id === "stages" && (
                      <>
                        <li>• Hiển thị từng giai đoạn</li>
                        <li>• Progress bar cho mỗi stage</li>
                        <li>• Trạng thái hoàn thành</li>
                        <li>• Mô tả chi tiết</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => startDemo(type.id)}
                  disabled={demoRunning}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
                >
                  {activeLoader === type.id ? "🔄 Đang Demo..." : "▶️ Xem Demo"}
                </button>
              </div>

              {/* Status indicator */}
              {activeLoader === type.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            💡 Mẹo Sử Dụng Loading Experience
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                🎯 Khi nào sử dụng:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>Interactive:</strong> Khi muốn người dùng tham gia vào
                  quá trình
                </li>
                <li>
                  <strong>Smart Progress:</strong> Khi cần thông tin chi tiết về
                  tiến trình
                </li>
                <li>
                  <strong>Magical:</strong> Khi muốn tạo cảm giác thú vị, ma
                  thuật
                </li>
                <li>
                  <strong>Stages:</strong> Khi muốn giải thích quy trình làm
                  việc
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">⚡ Lợi ích:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Giảm cảm giác chờ đợi nhàm chán</li>
                <li>• Tăng sự tương tác với người dùng</li>
                <li>• Cung cấp thông tin hữu ích</li>
                <li>• Tạo trải nghiệm đáng nhớ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
