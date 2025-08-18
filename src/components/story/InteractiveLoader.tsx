"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Heart, Star, Zap } from "lucide-react";

interface InteractiveLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const encouragements = [
  "Bạn có ý tưởng tuyệt vời! 🌟",
  "Câu chuyện này sẽ rất thú vị! 📚",
  "Sự sáng tạo của bạn thật tuyệt! ✨",
  "Hãy chuẩn bị cho một câu chuyện tuyệt vời! 🎭",
  "Bạn là một nhà kể chuyện tài ba! 🎨",
];

const funFacts = [
  "Trung bình một câu chuyện ngắn có khoảng 1,500 từ",
  "AI đang xử lý hàng triệu mẫu văn bản để tạo ra câu chuyện của bạn",
  "Mỗi giây AI có thể đọc được 10,000 từ",
  "Câu chuyện hay nhất thường có yếu tố bất ngờ",
  "Việc kể chuyện là một trong những kỹ năng cổ xưa nhất của con người",
];

export default function InteractiveLoader({
  isLoading,
  onComplete,
}: InteractiveLoaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentEncouragement, setCurrentEncouragement] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [hearts, setHearts] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [clickCount, setClickCount] = useState(0);

  // Cycle through encouragements and facts
  useEffect(() => {
    if (!isLoading) return;

    const encouragementInterval = setInterval(() => {
      setCurrentEncouragement((prev) => (prev + 1) % encouragements.length);
    }, 4000);

    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 6000);

    return () => {
      clearInterval(encouragementInterval);
      clearInterval(factInterval);
    };
  }, [isLoading]);

  // Handle heart animation
  const addHeart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newHeart = {
      id: Date.now(),
      x: x,
      y: y,
    };

    setHearts((prev) => [...prev, newHeart]);
    setClickCount((prev) => prev + 1);

    // Remove heart after animation
    setTimeout(() => {
      setHearts((prev) => prev.filter((heart) => heart.id !== newHeart.id));
    }, 2000);
  };

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 flex items-center justify-center z-50">
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full mx-4 border border-white/20 shadow-2xl">
        {/* Floating hearts */}
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute pointer-events-none animate-bounce"
            style={{
              left: heart.x,
              top: heart.y,
              animation: "float 2s ease-out forwards",
            }}
          >
            <Heart className="w-6 h-6 text-red-400 fill-current" />
          </div>
        ))}

        {/* Header with sound toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Đang tạo truyện...</h2>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Interactive center area */}
        <div
          className="text-center mb-8 cursor-pointer select-none"
          onClick={addHeart}
        >
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform">
              <Zap className="w-12 h-12 text-white animate-bounce" />
            </div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            <div
              className="absolute inset-2 rounded-full border-2 border-white/20 animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          <p className="text-white/80 text-sm mb-2">
            Nhấp để thêm năng lượng! ⚡
          </p>
          <p className="text-white/60 text-xs">Đã nhấp: {clickCount} lần</p>
        </div>

        {/* Encouragement */}
        <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="flex items-center mb-2">
            <Star className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-white font-medium">Động viên</span>
          </div>
          <p className="text-white/90 text-sm animate-fadeIn">
            {encouragements[currentEncouragement]}
          </p>
        </div>

        {/* Fun fact */}
        <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <span className="text-white font-medium">Bạn có biết?</span>
          </div>
          <p className="text-white/90 text-sm animate-fadeIn">
            {funFacts[currentFact]}
          </p>
        </div>

        {/* Progress visualization */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2 mb-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white/30 animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-white/70 text-sm">
              AI đang làm việc chăm chỉ...
            </p>
          </div>
        </div>

        {/* Interactive tips */}
        <div className="text-center">
          <p className="text-white/60 text-xs mb-2">
            💡 Mẹo: Nhấp vào biểu tượng sét để tăng thêm năng lượng sáng tạo!
          </p>

          {clickCount >= 10 && (
            <div className="animate-slideInUp">
              <p className="text-yellow-300 text-sm font-medium">
                🎉 Tuyệt vời! Bạn đã thêm rất nhiều năng lượng sáng tạo!
              </p>
            </div>
          )}

          {clickCount >= 20 && (
            <div className="animate-slideInUp mt-2">
              <p className="text-pink-300 text-sm font-medium">
                ⭐ Siêu tuyệt! Câu chuyện của bạn sẽ đặc biệt hơn nữa!
              </p>
            </div>
          )}
        </div>

        {/* Sound indicator */}
        {soundEnabled && (
          <div className="absolute top-4 right-16 text-white/60 text-xs">
            🔊 Âm thanh: Bật
          </div>
        )}
      </div>
    </div>
  );
}
