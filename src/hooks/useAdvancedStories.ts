import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StoryGenerationRequest, StoryTemplate } from "@/types/story";

// API functions
const advancedStoryApi = {
  generateStory: async (request: StoryGenerationRequest) => {
    const res = await fetch("/api/story/advanced", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `HTTP error! status: ${res.status}`);
    }

    return res.json();
  },

  getTemplates: async (filters?: { category?: string; popular?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.popular) params.append("popular", "true");

    const res = await fetch(`/api/story/templates?${params}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  },

  getAdvancedStories: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    const res = await fetch(`/api/stories/advanced?${params}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  },
};

// Query keys
export const advancedStoryKeys = {
  all: ["advanced-stories"] as const,
  stories: () => [...advancedStoryKeys.all, "stories"] as const,
  story: (id: string) => [...advancedStoryKeys.all, "story", id] as const,
  templates: () => [...advancedStoryKeys.all, "templates"] as const,
  template: (id: string) => [...advancedStoryKeys.all, "template", id] as const,
};

// Get story templates
export function useStoryTemplates(filters?: {
  category?: string;
  popular?: boolean;
}) {
  return useQuery({
    queryKey: [...advancedStoryKeys.templates(), filters],
    queryFn: () => advancedStoryApi.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.templates as StoryTemplate[],
  });
}

// Get advanced stories
export function useAdvancedStories(filters?: any) {
  return useQuery({
    queryKey: [...advancedStoryKeys.stories(), filters],
    queryFn: () => advancedStoryApi.getAdvancedStories(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Generate advanced story mutation
export function useGenerateAdvancedStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: advancedStoryApi.generateStory,
    onSuccess: (data) => {
      // Invalidate stories list
      queryClient.invalidateQueries({ queryKey: advancedStoryKeys.stories() });

      // Show success message
      toast.success("Story generated successfully! 🎉");

      // Log generation metadata for debugging
      if (data.metadata) {
        console.log("Story Generation Stats:", {
          wordCount: data.metadata.word_count,
          languageRatio: data.metadata.language_ratio,
          generationTime: `${data.metadata.generation_time}ms`,
          readabilityScore: data.metadata.readability_score,
        });
      }
    },
    onError: (error: any) => {
      console.error("Advanced story generation failed:", error);

      // Show specific error messages
      if (error.message.includes("timeout")) {
        toast.error("Story generation timed out. Please try again.");
      } else if (error.message.includes("rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error(
          error.message || "Failed to generate story. Please try again."
        );
      }
    },
  });
}

// Custom hook for template selection with preferences sync
export function useTemplateSelection() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<StoryTemplate | null>(null);
  const [preferences, setPreferences] = useState<StoryPreferences>({
    language_mix: {
      base_language: "vi",
      target_language: "en",
      ratio: 70,
    },
    style: {
      storytelling: "Jewish-style",
      tone: "friendly",
      readability_level: "A2",
    },
    length: "medium",
    structure: {
      include_quiz: true,
      include_glossary: true,
      sections: ["title", "story", "moral"],
    },
    vocab_focus: [],
    format: {
      markdown: true,
      bold_english: true,
    },
  });

  const selectTemplate = (template: StoryTemplate) => {
    setSelectedTemplate(template);

    // Sync preferences with template config
    if (template.config.language_mix) {
      setPreferences((prev) => ({
        ...prev,
        language_mix: {
          ...prev.language_mix,
          base_language: template.config.language_mix!.base_language,
          target_language: template.config.language_mix!.target_language,
          ratio: Math.round(template.config.language_mix!.ratio.vi * 100),
        },
      }));
    }

    if (template.config.style) {
      setPreferences((prev) => ({
        ...prev,
        style: {
          storytelling:
            template.config.style!.storytelling || prev.style.storytelling,
          tone: template.config.style!.tone || prev.style.tone,
          readability_level:
            template.config.style!.readability_level ||
            prev.style.readability_level,
        },
      }));
    }

    if (template.config.vocab_focus) {
      setPreferences((prev) => ({
        ...prev,
        vocab_focus: template.config.vocab_focus || [],
      }));
    }
  };

  return {
    selectedTemplate,
    preferences,
    setPreferences,
    selectTemplate,
    clearSelection: () => setSelectedTemplate(null),
  };
}

// Import useState for the custom hook
import { useState } from "react";
import { StoryPreferences } from "@/types/story";
