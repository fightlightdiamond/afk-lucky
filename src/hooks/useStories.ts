import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import type { Story } from "@/types/story";

// API functions
const storyApi = {
  getStories: async () => {
    return apiRequest<Story[]>("/api/stories");
  },

  createStory: async (prompt: string) => {
    return apiRequest<Story>("/api/story", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  },
};

// Query keys
export const storyKeys = {
  all: ["stories"] as const,
  lists: () => [...storyKeys.all, "list"] as const,
};

// Get stories hook
export function useStories() {
  return useQuery<Story[]>({
    queryKey: storyKeys.lists(),
    queryFn: storyApi.getStories,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Create story mutation
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storyApi.createStory,
    onSuccess: (data) => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });

      if (data.content) {
        toast.success("Tạo truyện thành công!");
      } else {
        toast.error("Không tạo được nội dung truyện");
      }
    },
    onError: (error: unknown) => {
      console.error("Create story failed:", error);
      toast.error("Đã xảy ra lỗi khi tạo truyện");
    },
  });
}
