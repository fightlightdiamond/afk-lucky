import { NextResponse } from "next/server";
import {
  getUserPreferences,
  saveUserPreferences,
  getDefaultPreferences,
} from "@/services/userPreferencesService";
import { StoryPreferences } from "@/types/story";

// GET - Fetch user preferences
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id");

    if (!userId && !sessionId) {
      return NextResponse.json({
        preferences: getDefaultPreferences(),
        isDefault: true,
      });
    }

    const preferences = await getUserPreferences(
      userId || undefined,
      sessionId || undefined
    );

    if (!preferences) {
      return NextResponse.json({
        preferences: getDefaultPreferences(),
        isDefault: true,
      });
    }

    return NextResponse.json({
      preferences,
      isDefault: false,
    });
  } catch (error: any) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// POST - Save user preferences
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { preferences, user_id, session_id, template_id } = body;

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences are required" },
        { status: 400 }
      );
    }

    // Validate preferences structure
    const validatedPreferences: StoryPreferences = {
      language_mix: {
        base_language: preferences.language_mix?.base_language || "vi",
        target_language: preferences.language_mix?.target_language || "en",
        ratio: Math.max(
          30,
          Math.min(90, preferences.language_mix?.ratio || 70)
        ),
      },
      style: {
        storytelling: preferences.style?.storytelling || "Jewish-style",
        tone: preferences.style?.tone || "friendly",
        readability_level: preferences.style?.readability_level || "A2",
      },
      length: preferences.length || "medium",
      structure: {
        include_quiz: Boolean(preferences.structure?.include_quiz),
        include_glossary: Boolean(preferences.structure?.include_glossary),
        sections: preferences.structure?.sections || [
          "title",
          "story",
          "moral",
        ],
      },
      vocab_focus: Array.isArray(preferences.vocab_focus)
        ? preferences.vocab_focus
        : [],
      format: {
        markdown: Boolean(preferences.format?.markdown),
        bold_english: Boolean(preferences.format?.bold_english),
      },
    };

    const result = await saveUserPreferences(
      validatedPreferences,
      user_id,
      session_id,
      template_id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to save preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id: result.sessionId,
      preferences: validatedPreferences,
    });
  } catch (error: any) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
