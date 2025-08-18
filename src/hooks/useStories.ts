import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const storyApi = {
  getStories: async () => {
    const res = await fetch("/api/stories");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  createStory: async (prompt: string) => {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  },
};

// Query keys
export const storyKeys = {
  all: ["stories"] as const,
  lists: () => [...storyKeys.all, "list"] as const,
};

// Get stories hook
export function useStories() {
  return useQuery({
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
    onError: (error: any) => {
      console.error("Create story failed:", error);
      toast.error("Đã xảy ra lỗi khi tạo truyện");
    },
  });
}
