"use client";

import { useUsageTracker, useVersionFeatures } from "@/hooks/useVersion";
import { BarChart3, AlertTriangle, Crown, Zap } from "lucide-react";
import Link from "next/link";

export default function UsageTracker() {
  const { usage, limits, getUsagePercentage, isNearLimit, canCreateStory } =
    useUsageTracker();
  const { version } = useVersionFeatures();

  if (!usage || !version) return null;

  const percentage = getUsagePercentage();
  const isUnlimited = !usage.dailyLimit;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-800">Daily Usage</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              version.isFree
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {version.name}
          </span>
        </div>

        {!version.isFree && <Crown className="w-4 h-4 text-yellow-500" />}
      </div>

      {isUnlimited ? (
        <div className="text-center py-4">
          <div className="text-2xl font-bold text-green-600 mb-1">∞</div>
          <div className="text-sm text-gray-600">Unlimited stories</div>
          <div className="text-xs text-gray-500 mt-1">
            {usage.today} stories created today
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                {limits?.currentUsage || 0} / {usage.dailyLimit}
              </span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 90
                    ? "bg-red-500"
                    : percentage >= 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className="text-sm">
            {!canCreateStory ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Daily limit reached</span>
              </div>
            ) : isNearLimit() ? (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Approaching daily limit</span>
              </div>
            ) : (
              <div className="text-green-600">
                {usage.remainingToday} stories remaining today
              </div>
            )}
          </div>
        </>
      )}

      {/* Upgrade CTA */}
      {version.isFree && (isNearLimit() || !canCreateStory) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-800">
                Need more stories?
              </div>
              <div className="text-xs text-purple-600">
                Upgrade for higher limits
              </div>
            </div>
            <Link
              href="/story/versions"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
            >
              <Zap className="w-3 h-3 mr-1" />
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      {usage.thisMonth > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            This month: {usage.thisMonth} stories • Total: {usage.total} stories
          </div>
        </div>
      )}
    </div>
  );
}
