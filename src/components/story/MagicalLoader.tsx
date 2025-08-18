"use client";

import { useState, useEffect } from "react";
import { Sparkles, Star, Zap } from "lucide-react";
import TypingAnimation from "./TypingAnimation";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number;
}

interface MagicalLoaderProps {
  isLoading: boolean;
  loadingText?: string;
  tips?: string[];
}

const loadingTips = [
  "AI đang phân tích ngữ cảnh của câu chuyện...",
  "Đang tạo ra các nhân vật thú vị...",
  "Đang dệt nên cốt truyện hấp dẫn...",
  "Đang thêm những chi tiết sinh động...",
  "Đang hoàn thiện câu chuyện của bạn...",
  "Sắp hoàn thành rồi, chờ chút nhé!",
];

export default function MagicalLoader({
  isLoading,
  loadingText = "Đang tạo truyện...",
  tips = loadingTips,
}: MagicalLoaderProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentTip, setCurrentTip] = useState(0);

  // Generate particles
  useEffect(() => {
    if (!isLoading) {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          color: [
            "text-purple-400",
            "text-pink-400",
            "text-blue-400",
            "text-yellow-400",
          ][Math.floor(Math.random() * 4)],
          speed: Math.random() * 2 + 1,
          direction: Math.random() * 360,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x:
            (particle.x + Math.cos(particle.direction) * particle.speed + 100) %
            100,
          y:
            (particle.y + Math.sin(particle.direction) * particle.speed + 100) %
            100,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Cycle through tips
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, tips.length]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-pink-900/90 flex items-center justify-center z-50">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${particle.color} opacity-70`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: `${particle.size}px`,
            }}
          >
            <Sparkles className="animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full mx-4 border border-white/20 shadow-2xl">
        {/* Central animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Rotating rings */}
            <div className="absolute inset-0 animate-spin">
              <div className="w-24 h-24 border-4 border-purple-400/30 border-t-purple-400 rounded-full"></div>
            </div>
            <div
              className="absolute inset-2 animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "3s" }}
            >
              <div className="w-20 h-20 border-4 border-pink-400/30 border-t-pink-400 rounded-full"></div>
            </div>

            {/* Center icon */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full animate-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{loadingText}</h2>
          <div className="text-purple-200 text-lg min-h-[1.5rem]">
            <TypingAnimation
              texts={[tips[currentTip]]}
              speed={50}
              className="text-purple-200"
            />
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-white/30 animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>

        {/* Fun elements */}
        <div className="flex justify-center space-x-4 text-white/70">
          <Star
            className="w-5 h-5 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <Sparkles
            className="w-5 h-5 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <Star
            className="w-5 h-5 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        {/* Estimated time */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>Thời gian ước tính: 30-60 giây</p>
        </div>
      </div>
    </div>
  );
}
