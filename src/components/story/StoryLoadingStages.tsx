"use client";

import { useState, useEffect } from "react";
import { Sparkles, BookOpen, Wand2, Zap, CheckCircle } from "lucide-react";

interface LoadingStage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in milliseconds
  color: string;
}

const loadingStages: LoadingStage[] = [
  {
    id: "analyzing",
    title: "Phân tích prompt",
    description: "Đang hiểu ý tưởng của bạn...",
    icon: <BookOpen className="w-6 h-6" />,
    duration: 2000,
    color: "text-blue-600",
  },
  {
    id: "brainstorming",
    title: "Sáng tạo ý tưởng",
    description: "Đang nghĩ ra cốt truyện thú vị...",
    icon: <Sparkles className="w-6 h-6" />,
    duration: 3000,
    color: "text-purple-600",
  },
  {
    id: "writing",
    title: "Viết truyện",
    description: "Đang dệt nên câu chuyện của bạn...",
    icon: <Wand2 className="w-6 h-6" />,
    duration: 4000,
    color: "text-green-600",
  },
  {
    id: "polishing",
    title: "Hoàn thiện",
    description: "Đang chỉnh sửa và làm đẹp...",
    icon: <Zap className="w-6 h-6" />,
    duration: 2000,
    color: "text-orange-600",
  },
];

interface StoryLoadingStagesProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export default function StoryLoadingStages({
  isLoading,
  onComplete,
}: StoryLoadingStagesProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStageIndex(0);
      setCompletedStages([]);
      setProgress(0);
      return;
    }

    let stageTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const runStage = (index: number) => {
      if (index >= loadingStages.length) {
        onComplete?.();
        return;
      }

      const stage = loadingStages[index];
      setCurrentStageIndex(index);

      // Progress animation for current stage
      let currentProgress = 0;
      const progressIncrement = 100 / (stage.duration / 50);

      progressTimer = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressTimer);
        }
        setProgress(currentProgress);
      }, 50);

      // Move to next stage
      stageTimer = setTimeout(() => {
        setCompletedStages((prev) => [...prev, stage.id]);
        setProgress(0);
        runStage(index + 1);
      }, stage.duration);
    };

    runStage(0);

    return () => {
      clearTimeout(stageTimer);
      clearInterval(progressTimer);
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  const currentStage = loadingStages[currentStageIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đang tạo truyện cho bạn
          </h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
        </div>

        {/* Current Stage */}
        {currentStage && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className={`${currentStage.color} mr-3 animate-bounce`}>
                {currentStage.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {currentStage.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentStage.description}
                </p>
              </div>
            </div>

            {/* Progress bar for current stage */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* All Stages Progress */}
        <div className="space-y-3">
          {loadingStages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-50 border border-green-200"
                    : isCurrent
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`mr-3 ${
                    isCompleted
                      ? "text-green-600"
                      : isCurrent
                      ? stage.color
                      : "text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className={isCurrent ? "animate-pulse" : ""}>
                      {stage.icon}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? "text-green-800"
                        : isCurrent
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {stage.title}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-gray-600 mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
                {isCompleted && (
                  <div className="text-green-600 text-xs font-medium">
                    ✓ Hoàn thành
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fun facts */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 text-center">
            <Sparkles className="w-4 h-4 inline mr-1" />
            <strong>Bạn có biết?</strong> AI đang xử lý hàng triệu từ để tạo ra
            câu chuyện hoàn hảo cho bạn!
          </p>
        </div>
      </div>
    </div>
  );
}
