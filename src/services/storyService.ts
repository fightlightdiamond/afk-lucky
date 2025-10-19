import {
  generateStory,
  generateAdvancedStory,
  type AdvancedStoryRequest,
} from "@/lib/aiapi";
import prisma from "@/lib/prisma";
import {
  StoryConfig,
  StoryPreferences,
  StoryGenerationRequest,
} from "@/types/story";

// Helper functions to map frontend values to Python API values
function mapStorytellingStyle(
  style: string
): "narrative" | "dialogue" | "descriptive" | "mixed" {
  const mapping: Record<
    string,
    "narrative" | "dialogue" | "descriptive" | "mixed"
  > = {
    "Jewish-style": "narrative",
    Western: "narrative",
    Eastern: "narrative",
    Modern: "mixed",
    narrative: "narrative",
    dialogue: "dialogue",
    descriptive: "descriptive",
    mixed: "mixed",
  };
  return mapping[style] || "narrative";
}

function mapTone(
  tone: string
): "friendly" | "formal" | "casual" | "educational" | "entertaining" {
  const mapping: Record<
    string,
    "friendly" | "formal" | "casual" | "educational" | "entertaining"
  > = {
    friendly: "friendly",
    formal: "formal",
    casual: "casual",
    professional: "formal",
    educational: "educational",
    entertaining: "entertaining",
  };
  return mapping[tone] || "friendly";
}

function mapReadabilityLevel(
  level: string
): "beginner" | "intermediate" | "advanced" {
  const mapping: Record<string, "beginner" | "intermediate" | "advanced"> = {
    A1: "beginner",
    A2: "beginner",
    B1: "intermediate",
    B2: "intermediate",
    C1: "advanced",
    C2: "advanced",
    beginner: "beginner",
    intermediate: "intermediate",
    advanced: "advanced",
  };
  return mapping[level] || "intermediate";
}

// Simple story generation (backward compatibility)
export async function createAndSaveStory(prompt: string) {
  const content = await generateStory(prompt);

  const story = await prisma.story.create({
    data: {
      prompt,
      content,
    },
  });

  return story;
}

// Advanced story generation with configuration
export async function createAdvancedStory(request: StoryGenerationRequest) {
  // Convert to API request format
  const apiRequest: AdvancedStoryRequest = {
    prompt: request.prompt,
    config: request.config
      ? {
          vocab_focus: request.config.vocab_focus,
          core_topic: request.config.core_topic,
        }
      : undefined,
    preferences: request.preferences
      ? {
          length: request.preferences.length,
          language_mix: request.preferences.language_mix
            ? {
                ratio: request.preferences.language_mix.ratio,
                base_language: request.preferences.language_mix.base_language,
                target_language:
                  request.preferences.language_mix.target_language,
              }
            : undefined,
          style: request.preferences.style
            ? {
                storytelling: mapStorytellingStyle(
                  request.preferences.style.storytelling
                ),
                tone: mapTone(request.preferences.style.tone),
                readability_level: mapReadabilityLevel(
                  request.preferences.style.readability_level
                ),
              }
            : undefined,
          format: request.preferences.format
            ? {
                bold_english: request.preferences.format.bold_english,
              }
            : undefined,
          structure: request.preferences.structure
            ? {
                sections: request.preferences.structure.sections,
                include_quiz: request.preferences.structure.include_quiz,
                include_glossary:
                  request.preferences.structure.include_glossary,
              }
            : undefined,
        }
      : undefined,
    template_id: request.template_id,
  };

  // Generate story using Python API
  let storyResponse;
  try {
    console.log("🎯 Calling Python API with request:", apiRequest);
    storyResponse = await generateAdvancedStory(apiRequest);
    console.log("📦 Python API response:", storyResponse);
  } catch (error) {
    console.error("💥 Python API call failed:", error);

    // Better error handling to avoid [object Object] errors
    let errorMessage = "Failed to generate story";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      // Try to extract meaningful error message from object
      if ("message" in error) {
        errorMessage = String(error.message);
      } else if ("detail" in error) {
        errorMessage = String(error.detail);
      } else if ("error" in error) {
        errorMessage = String(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else {
      errorMessage = String(error);
    }

    throw new Error(errorMessage);
  }

  if (storyResponse.error) {
    throw new Error(storyResponse.error);
  }

  // Save to database
  const story = await prisma.story.create({
    data: {
      prompt: request.prompt,
      content: storyResponse.content,
      title: storyResponse.title,
      config: request.config as any,
      preferences: request.preferences as unknown,
      template_id: request.template_id,
      sections: storyResponse.sections
        ? JSON.parse(JSON.stringify(storyResponse.sections))
        : null,
      metadata: storyResponse.metadata
        ? JSON.parse(JSON.stringify(storyResponse.metadata))
        : null,
      word_count: storyResponse.metadata?.word_count || 0,
      language_ratio: storyResponse.metadata?.language_ratio
        ? JSON.parse(JSON.stringify(storyResponse.metadata.language_ratio))
        : null,
      generation_time: storyResponse.metadata?.generation_time || 0,
    },
  });

  return {
    ...story,
    sections: storyResponse.sections,
    metadata: storyResponse.metadata,
  };
}

// Helper functions are now handled by the Python API

// Get all stories
export async function getStories() {
  return prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Get stories with advanced filtering
export async function getAdvancedStories(filters?: {
  template_id?: string;
  category?: string;
  language_ratio?: { min_vi?: number; max_vi?: number };
  word_count?: { min?: number; max?: number };
}) {
  const where: Record<string, unknown> = {};

  if (filters?.template_id) {
    where.template_id = filters.template_id;
  }

  // Add more filtering logic as needed

  return prisma.story.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      // Include related data if needed
    },
  });
}
