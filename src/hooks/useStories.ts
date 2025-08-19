import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

interface Story {
  id: string;
  content: string;
}

// API functions
const storyApi = {
  getStories: async (): Promise<Story[]> => {
    const res = await fetch("/api/stories");
    if (!res.ok) {
      throw new ApiError(`HTTP error! status: ${res.status}`, res.status);
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as Story[]) : [];
  },

  createStory: async (prompt: string): Promise<Story> => {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new ApiError(`HTTP error! status: ${res.status}`, res.status);
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
  return useQuery<Story[], ApiError>({
    queryKey: storyKeys.lists(),
    queryFn: storyApi.getStories,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Create story mutation
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation<Story, ApiError, string>({
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
    onError: (error: ApiError) => {
      console.error("Create story failed:", error);
      toast.error("Đã xảy ra lỗi khi tạo truyện");
    },
  });
}
