import { NextResponse } from "next/server";
import { createAdvancedStory } from "@/services/storyService";
import {
  saveUserPreferences,
  trackStoryUsage,
} from "@/services/userPreferencesService";
import { StoryGenerationRequest } from "@/types/story";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build the story generation request
    const request: StoryGenerationRequest = {
      prompt: body.prompt,
      preferences: body.preferences || {
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
          include_quiz: false,
          include_glossary: false,
          sections: ["title", "story"],
        },
        vocab_focus: [],
        format: {
          markdown: true,
          bold_english: true,
        },
      },
      config: body.config || {
        meta: {
          task: "generate_story",
          version: "1.0",
        },
        guardrails: {
          stay_on_topic: true,
          reject_if_off_topic: "Keep story focused on the given prompt",
          facts_policy: "Use realistic scenarios",
          appropriateness: "Keep content clean and respectful",
          hallucination_control: "Avoid making up specific technical details",
        },
        language_mix: {
          base_language: body.preferences?.language_mix?.base_language || "vi",
          target_language:
            body.preferences?.language_mix?.target_language || "en",
          ratio: {
            vi: (body.preferences?.language_mix?.ratio || 70) / 100,
            en: (100 - (body.preferences?.language_mix?.ratio || 70)) / 100,
          },
          formatting: {
            english_bold: body.preferences?.format?.bold_english || true,
          },
        },
        style: {
          storytelling: body.preferences?.style?.storytelling || "Jewish-style",
          tone: body.preferences?.style?.tone || "friendly",
          pacing: "setup → conflict → reflection → lesson",
          readability_level: body.preferences?.style?.readability_level || "A2",
        },
        core_topic: body.prompt,
        vocab_focus: body.preferences?.vocab_focus || [],
        length: {
          min_words: getLengthRange(body.preferences?.length || "medium").min,
          max_words: getLengthRange(body.preferences?.length || "medium").max,
        },
        structure: {
          sections: body.preferences?.structure?.sections || ["title", "story"],
          mini_quiz_rules: {
            count: 3,
            type: "MCQ A-D",
            show_answers: true,
          },
          glossary_rules: {
            items: 6,
          },
        },
        format_constraints: {
          markdown: body.preferences?.format?.markdown || true,
          bold_english_only: body.preferences?.format?.bold_english || true,
        },
      },
      template_id: body.template_id,
    };

    // Generate the story
    const startTime = Date.now();
    const story = await createAdvancedStory(request);
    const generationTime = Date.now() - startTime;

    // Save user preferences (async, don't wait)
    const userId = body.user_id;
    const sessionId = body.session_id;

    saveUserPreferences(
      request.preferences,
      userId,
      sessionId,
      request.template_id
    ).catch((error) => {
      console.error("Failed to save user preferences:", error);
    });

    // Track usage analytics (async, don't wait)
    trackStoryUsage({
      storyId: story.id,
      templateId: request.template_id,
      preferences: request.preferences,
      generationTime,
      wordCount: story.word_count || 0,
      success: true,
      userId,
      sessionId,
    }).catch((error) => {
      console.error("Failed to track story usage:", error);
    });

    return NextResponse.json({
      success: true,
      ...story,
      session_id: sessionId, // Return session ID for anonymous users
    });
  } catch (error: any) {
    console.error("Advanced story generation error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to generate story",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to get word count range based on length preference
function getLengthRange(length: string) {
  switch (length) {
    case "short":
      return { min: 150, max: 250 };
    case "medium":
      return { min: 250, max: 400 };
    case "long":
      return { min: 400, max: 600 };
    default:
      return { min: 250, max: 400 };
  }
}
