import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { StoryPreferences } from "@/types/story";
import { useAuthStore } from "@/store";

// API functions
const preferencesApi = {
  getPreferences: async (userId?: string, sessionId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const res = await fetch(`/api/user/preferences?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  savePreferences: async (data: {
    preferences: StoryPreferences;
    user_id?: string;
    session_id?: string;
    template_id?: string;
  }) => {
    const res = await fetch("/api/user/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getFavorites: async (userId?: string, sessionId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const res = await fetch(`/api/user/favorites?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  addFavorite: async (data: {
    template_id: string;
    user_id?: string;
    session_id?: string;
  }) => {
    const res = await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  removeFavorite: async (
    templateId: string,
    userId?: string,
    sessionId?: string
  ) => {
    const params = new URLSearchParams();
    params.append("template_id", templateId);
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const res = await fetch(`/api/user/favorites?${params}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getAnalytics: async (userId?: string, sessionId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const res = await fetch(`/api/user/analytics?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
};

// Query keys
export const userPreferencesKeys = {
  all: ["user-preferences"] as const,
  preferences: (userId?: string, sessionId?: string) =>
    [...userPreferencesKeys.all, "preferences", userId, sessionId] as const,
  favorites: (userId?: string, sessionId?: string) =>
    [...userPreferencesKeys.all, "favorites", userId, sessionId] as const,
  analytics: (userId?: string, sessionId?: string) =>
    [...userPreferencesKeys.all, "analytics", userId, sessionId] as const,
};

// Main hook for user preferences
export function useUserPreferences() {
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string>();
  const queryClient = useQueryClient();

  // Initialize session ID for anonymous users
  useEffect(() => {
    if (!user && !sessionId) {
      const storedSessionId = localStorage.getItem("story_session_id");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("story_session_id", newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [user, sessionId]);

  // Get preferences query
  const preferencesQuery = useQuery({
    queryKey: userPreferencesKeys.preferences(user?.id, sessionId),
    queryFn: () => preferencesApi.getPreferences(user?.id, sessionId),
    enabled: !!(user?.id || sessionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: (data: {
      preferences: StoryPreferences;
      template_id?: string;
    }) =>
      preferencesApi.savePreferences({
        ...data,
        user_id: user?.id,
        session_id: sessionId,
      }),
    onSuccess: (data) => {
      // Update session ID if returned
      if (data.session_id && !user) {
        setSessionId(data.session_id);
        localStorage.setItem("story_session_id", data.session_id);
      }

      // Invalidate preferences query
      queryClient.invalidateQueries({
        queryKey: userPreferencesKeys.preferences(user?.id, sessionId),
      });
    },
  });

  return {
    preferences: preferencesQuery.data?.preferences,
    isDefault: preferencesQuery.data?.isDefault,
    isLoading: preferencesQuery.isLoading,
    error: preferencesQuery.error,
    savePreferences: savePreferencesMutation.mutate,
    isSaving: savePreferencesMutation.isPending,
    sessionId,
    userId: user?.id,
  };
}

// Hook for favorite templates
export function useFavoriteTemplates() {
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

  const favoritesQuery = useQuery({
    queryKey: userPreferencesKeys.favorites(user?.id, sessionId),
    queryFn: () => preferencesApi.getFavorites(user?.id, sessionId),
    enabled: !!(user?.id || sessionId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (templateId: string) =>
      preferencesApi.addFavorite({
        template_id: templateId,
        user_id: user?.id,
        session_id: sessionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userPreferencesKeys.favorites(user?.id, sessionId),
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (templateId: string) =>
      preferencesApi.removeFavorite(templateId, user?.id, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userPreferencesKeys.favorites(user?.id, sessionId),
      });
    },
  });

  return {
    favorites: favoritesQuery.data?.favorites || [],
    isLoading: favoritesQuery.isLoading,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
  };
}

// Hook for user analytics
export function useUserAnalytics() {
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    if (!user && !sessionId) {
      const storedSessionId = localStorage.getItem("story_session_id");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    }
  }, [user, sessionId]);

  return useQuery({
    queryKey: userPreferencesKeys.analytics(user?.id, sessionId),
    queryFn: () => preferencesApi.getAnalytics(user?.id, sessionId),
    enabled: !!(user?.id || sessionId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for auto-saving preferences
export function useAutoSavePreferences(
  preferences: StoryPreferences,
  templateId?: string
) {
  const { savePreferences, isSaving } = useUserPreferences();
  const [lastSaved, setLastSaved] = useState<string>();

  useEffect(() => {
    const preferencesString = JSON.stringify(preferences);

    // Don't save if preferences haven't changed
    if (preferencesString === lastSaved) return;

    // Debounce saving
    const timeoutId = setTimeout(() => {
      savePreferences({ preferences, template_id: templateId });
      setLastSaved(preferencesString);
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [preferences, templateId, savePreferences, lastSaved]);

  return { isSaving };
}
