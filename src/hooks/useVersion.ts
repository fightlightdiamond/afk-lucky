import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

// API functions
const versionApi = {
  getUserVersion: async (userId?: string, sessionId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const res = await fetch(`/api/user/version?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  checkLimits: async (data: {
    user_id?: string;
    session_id?: string;
    action: string;
  }) => {
    const res = await fetch("/api/user/version", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
};

// Query keys
export const versionKeys = {
  all: ["version"] as const,
  user: (userId?: string, sessionId?: string) =>
    [...versionKeys.all, "user", userId, sessionId] as const,
  limits: (userId?: string, sessionId?: string, action?: string) =>
    [...versionKeys.all, "limits", userId, sessionId, action] as const,
};

// Main hook for user version
export function useUserVersion() {
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string>();

  // Initialize session ID for anonymous users
  useEffect(() => {
    if (!user && !sessionId) {
      const storedSessionId = localStorage.getItem("story_session_id");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    }
  }, [user, sessionId]);

  const versionQuery = useQuery({
    queryKey: versionKeys.user(user?.id, sessionId),
    queryFn: () => versionApi.getUserVersion(user?.id, sessionId),
    enabled: !!(user?.id || sessionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute to update usage
  });

  return {
    version: versionQuery.data?.version,
    usage: versionQuery.data?.usage,
    limits: versionQuery.data?.limits,
    isLoading: versionQuery.isLoading,
    error: versionQuery.error,
    refetch: versionQuery.refetch,
    sessionId,
    userId: user?.id,
  };
}

// Hook for checking specific action limits
export function useActionLimits(action: string = "create_story") {
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user && !sessionId) {
      const storedSessionId = localStorage.getItem("story_session_id");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    }
  }, [user, sessionId]);

  const checkLimitsMutation = useMutation({
    mutationFn: () =>
      versionApi.checkLimits({
        user_id: user?.id,
        session_id: sessionId,
        action,
      }),
    onSuccess: (data) => {
      if (!data.allowed && data.reason) {
        toast.error(data.reason);
      }
    },
  });

  const checkLimits = async (): Promise<boolean> => {
    try {
      const result = await checkLimitsMutation.mutateAsync();
      return result.allowed;
    } catch (error) {
      console.error("Error checking limits:", error);
      return false;
    }
  };

  return {
    checkLimits,
    isChecking: checkLimitsMutation.isPending,
  };
}

// Hook for version-aware features
export function useVersionFeatures() {
  const { version } = useUserVersion();

  const hasFeature = (feature: string): boolean => {
    if (!version) return false;

    switch (feature) {
      case "customTemplates":
        return version.advancedFeatures?.customTemplates || false;
      case "bulkGeneration":
        return version.advancedFeatures?.bulkGeneration || false;
      case "apiAccess":
        return version.advancedFeatures?.apiAccess || false;
      case "analytics":
        return version.advancedFeatures?.analytics || false;
      case "prioritySupport":
        return version.advancedFeatures?.prioritySupport || false;
      case "versionHistory":
        return version.advancedFeatures?.versionHistory || false;
      case "collaborativeEditing":
        return version.advancedFeatures?.collaborativeEditing || false;
      case "customBranding":
        return version.advancedFeatures?.customBranding || false;
      default:
        return false;
    }
  };

  const canExport = (format: string): boolean => {
    if (!version) return false;
    return version.advancedFeatures?.exportFormats?.includes(format) || false;
  };

  const getAvailableExportFormats = (): string[] => {
    return version?.advancedFeatures?.exportFormats || ["txt"];
  };

  return {
    version,
    hasFeature,
    canExport,
    getAvailableExportFormats,
    isLoading: !version,
  };
}

// Hook for usage tracking with limits
export function useUsageTracker() {
  const { usage, limits, refetch } = useUserVersion();
  const queryClient = useQueryClient();

  const trackUsage = async (action: string = "create_story") => {
    // Refetch to get updated usage
    await refetch();

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: versionKeys.all });
  };

  const getUsagePercentage = (): number => {
    if (!usage?.dailyLimit || !limits?.currentUsage) return 0;
    return Math.round((limits.currentUsage / usage.dailyLimit) * 100);
  };

  const isNearLimit = (threshold: number = 80): boolean => {
    return getUsagePercentage() >= threshold;
  };

  return {
    usage,
    limits,
    trackUsage,
    getUsagePercentage,
    isNearLimit,
    canCreateStory: limits?.canCreateStory || false,
  };
}
