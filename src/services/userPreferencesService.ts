import prisma from "@/lib/prisma";
import { StoryPreferences } from "@/types/story";

// Generate session ID for anonymous users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get user preferences
export async function getUserPreferences(
  userId?: string,
  sessionId?: string
): Promise<StoryPreferences | null> {
  try {
    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const userPrefs = await prisma.userPreferences.findUnique({
      where,
    });

    if (!userPrefs) return null;

    return userPrefs.preferences as StoryPreferences;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

// Save or update user preferences
export async function saveUserPreferences(
  preferences: StoryPreferences,
  userId?: string,
  sessionId?: string,
  templateId?: string
): Promise<{ success: boolean; sessionId?: string }> {
  try {
    // Generate session ID if not provided and no user ID
    if (!userId && !sessionId) {
      sessionId = generateSessionId();
    }

    const data = {
      preferences: preferences as any,
      last_used_template_id: templateId,
      updated_at: new Date(),
    };

    if (userId) {
      // Authenticated user
      await prisma.userPreferences.upsert({
        where: { user_id: userId },
        update: {
          ...data,
          usage_count: { increment: 1 },
        },
        create: {
          user_id: userId,
          ...data,
        },
      });
    } else if (sessionId) {
      // Anonymous user
      await prisma.userPreferences.upsert({
        where: { session_id: sessionId },
        update: {
          ...data,
          usage_count: { increment: 1 },
        },
        create: {
          session_id: sessionId,
          ...data,
        },
      });
    }

    return { success: true, sessionId };
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return { success: false };
  }
}

// Add template to favorites
export async function addFavoriteTemplate(
  templateId: string,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  try {
    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const userPrefs = await prisma.userPreferences.findUnique({ where });

    if (!userPrefs) return false;

    const currentFavorites = userPrefs.favorite_templates || [];
    if (currentFavorites.includes(templateId)) return true; // Already favorite

    await prisma.userPreferences.update({
      where,
      data: {
        favorite_templates: [...currentFavorites, templateId],
      },
    });

    return true;
  } catch (error) {
    console.error("Error adding favorite template:", error);
    return false;
  }
}

// Remove template from favorites
export async function removeFavoriteTemplate(
  templateId: string,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  try {
    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const userPrefs = await prisma.userPreferences.findUnique({ where });

    if (!userPrefs) return false;

    const currentFavorites = userPrefs.favorite_templates || [];
    const updatedFavorites = currentFavorites.filter((id) => id !== templateId);

    await prisma.userPreferences.update({
      where,
      data: {
        favorite_templates: updatedFavorites,
      },
    });

    return true;
  } catch (error) {
    console.error("Error removing favorite template:", error);
    return false;
  }
}

// Get user's favorite templates
export async function getFavoriteTemplates(
  userId?: string,
  sessionId?: string
): Promise<string[]> {
  try {
    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const userPrefs = await prisma.userPreferences.findUnique({ where });

    return userPrefs?.favorite_templates || [];
  } catch (error) {
    console.error("Error fetching favorite templates:", error);
    return [];
  }
}

// Track story usage analytics
export async function trackStoryUsage(data: {
  storyId: string;
  templateId?: string;
  preferences: StoryPreferences;
  generationTime: number;
  wordCount: number;
  success: boolean;
  userId?: string;
  sessionId?: string;
}): Promise<boolean> {
  try {
    await prisma.storyUsageAnalytics.create({
      data: {
        user_id: data.userId,
        session_id: data.sessionId,
        story_id: data.storyId,
        template_id: data.templateId,
        language_ratio: {
          vi: data.preferences.language_mix.ratio,
          en: 100 - data.preferences.language_mix.ratio,
        } as any,
        story_length: data.preferences.length,
        readability_level: data.preferences.style.readability_level,
        tone: data.preferences.style.tone,
        generation_time: data.generationTime,
        word_count: data.wordCount,
        success: data.success,
      },
    });

    return true;
  } catch (error) {
    console.error("Error tracking story usage:", error);
    return false;
  }
}

// Get user analytics summary
export async function getUserAnalytics(userId?: string, sessionId?: string) {
  try {
    if (!userId && !sessionId) {
      return null;
    }
    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const analytics = await prisma.storyUsageAnalytics.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50, // Last 50 stories
    });

    // Calculate statistics
    const totalStories = analytics.length;
    const successfulStories = analytics.filter((a) => a.success).length;
    const averageGenerationTime =
      analytics.reduce((sum, a) => sum + a.generation_time, 0) / totalStories ||
      0;
    const averageWordCount =
      analytics.reduce((sum, a) => sum + a.word_count, 0) / totalStories || 0;

    // Most used settings
    const languageRatios = analytics.map((a) => (a.language_ratio as any).vi);
    const mostUsedRatio = languageRatios.reduce((a, b, i, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
        ? a
        : b
    );

    const lengthCounts = analytics.reduce((acc, a) => {
      acc[a.story_length] = (acc[a.story_length] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedLength = Object.entries(lengthCounts).reduce((a, b) =>
      lengthCounts[a[0]] > lengthCounts[b[0]] ? a : b
    )?.[0];

    return {
      totalStories,
      successfulStories,
      successRate: (successfulStories / totalStories) * 100,
      averageGenerationTime: Math.round(averageGenerationTime),
      averageWordCount: Math.round(averageWordCount),
      mostUsedLanguageRatio: mostUsedRatio,
      mostUsedLength,
      recentStories: analytics.slice(0, 10),
    };
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return null;
  }
}

// Get default preferences
export function getDefaultPreferences(): StoryPreferences {
  return {
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
  };
}
