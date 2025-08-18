"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Wand2, CheckCircle } from "lucide-react";

interface SmartProgressLoaderProps {
  isLoading: boolean;
  estimatedTime?: number; // in seconds
  onComplete?: () => void;
}

const motivationalMessages = [
  "Đang khơi nguồn cảm hứng...",
  "Những ý tưởng tuyệt vời đang hình thành...",
  "Câu chuyện của bạn đang được dệt nên...",
  "Thêm chút màu sắc vào truyện...",
  "Hoàn thiện những chi tiết cuối cùng...",
  "Sắp xong rồi, hãy kiên nhẫn nhé!",
];

export default function SmartProgressLoader({
  isLoading,
  estimatedTime = 45,
  onComplete,
}: SmartProgressLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentMessage(0);
      setElapsedTime(0);
      setIsOvertime(false);
      return;
    }

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);

      // Smart progress calculation
      let calculatedProgress;
      if (elapsed <= estimatedTime) {
        // Normal progress curve (slower at start, faster in middle, slower at end)
        const normalizedTime = elapsed / estimatedTime;
        calculatedProgress = 100 * (1 - Math.exp(-3 * normalizedTime));
      } else {
        // Overtime - slow down progress significantly
        setIsOvertime(true);
        const overtimeSeconds = elapsed - estimatedTime;
        calculatedProgress = 85 + 15 * (1 - Math.exp(-overtimeSeconds / 30));
      }

      setProgress(Math.min(calculatedProgress, 99));

      // Change message every 5 seconds
      const messageIndex =
        Math.floor(elapsed / 5) % motivationalMessages.length;
      setCurrentMessage(messageIndex);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, estimatedTime]);

  if (!isLoading) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-float">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-sparkle">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đang tạo truyện
          </h2>
          <p className="text-gray-600 animate-pulse">
            {motivationalMessages[currentMessage]}
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
            </div>

            {/* Shimmer effect */}
            <div
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
              style={{
                left: `${Math.max(0, progress - 8)}%`,
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Progress Info */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {Math.round(progress)}% hoàn thành
            </span>
            <span
              className={`font-medium ${
                isOvertime ? "text-orange-600" : "text-gray-600"
              }`}
            >
              {formatTime(elapsedTime)}
              {!isOvertime && ` / ${formatTime(estimatedTime)}`}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-3 mb-6">
          {/* Current Status */}
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-blue-800 text-sm font-medium">
              {motivationalMessages[currentMessage]}
            </span>
          </div>

          {/* Overtime Warning */}
          {isOvertime && (
            <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200 animate-slideInUp">
              <Wand2 className="w-4 h-4 text-orange-600 mr-2 animate-spin" />
              <span className="text-orange-800 text-sm">
                Đang tạo ra một câu chuyện đặc biệt phức tạp...
              </span>
            </div>
          )}
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(elapsedTime * 1000).toLocaleString()}
            </div>
            <div className="text-xs text-purple-600">Từ đã xử lý</div>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">
              {Math.floor(progress / 10)}
            </div>
            <div className="text-xs text-pink-600">Ý tưởng đã tạo</div>
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            {progress < 30 && "Đang bắt đầu hành trình sáng tạo..."}
            {progress >= 30 &&
              progress < 60 &&
              "Câu chuyện đang dần hình thành!"}
            {progress >= 60 && progress < 85 && "Gần hoàn thành rồi!"}
            {progress >= 85 && "Những chạm cuối cùng..."}
          </p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
