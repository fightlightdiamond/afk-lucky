"use client";

import { useUserAnalytics } from "@/hooks/useUserPreferences";
import {
  BarChart3,
  Clock,
  FileText,
  TrendingUp,
  Zap,
  Globe,
} from "lucide-react";

export default function UserAnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useUserAnalytics();

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500 text-center">No analytics data available</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Stories",
      value: analytics.totalStories,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Success Rate",
      value: `${Math.round(analytics.successRate)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Avg Generation Time",
      value: `${(analytics.averageGenerationTime / 1000).toFixed(1)}s`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Avg Word Count",
      value: analytics.averageWordCount,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Your Story Analytics
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg ${stat.bgColor} border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Preferences Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Most Used Language Ratio
          </h4>
          <div className="text-2xl font-bold text-blue-600">
            {analytics.mostUsedLanguageRatio}% VI
          </div>
          <div className="text-sm text-blue-600">
            {100 - analytics.mostUsedLanguageRatio}% English
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Preferred Story Length
          </h4>
          <div className="text-2xl font-bold text-green-600 capitalize">
            {analytics.mostUsedLength}
          </div>
          <div className="text-sm text-green-600">
            {analytics.mostUsedLength === "short" && "150-250 words"}
            {analytics.mostUsedLength === "medium" && "250-400 words"}
            {analytics.mostUsedLength === "long" && "400-600 words"}
          </div>
        </div>
      </div>

      {/* Recent Stories */}
      {analytics.recentStories && analytics.recentStories.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Stories</h4>
          <div className="space-y-2">
            {analytics.recentStories
              .slice(0, 5)
              .map((story: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        story.success ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-gray-700">
                      {story.story_length} story, {story.readability_level}{" "}
                      level
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(story.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
