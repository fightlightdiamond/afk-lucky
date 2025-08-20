import { generateStory } from "@/lib/together";
import prisma from "@/lib/prisma";
import {
  StoryConfig,
  StoryPreferences,
  StoryGenerationRequest,
} from "@/types/story";

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
  const startTime = Date.now();

  // Build the enhanced prompt based on configuration
  const enhancedPrompt = buildEnhancedPrompt(request);

  // Generate the story content
  const content = await generateStory(enhancedPrompt);

  // Parse and structure the content
  const structuredContent = parseStoryContent(content, request.preferences);

  // Calculate metadata
  const generationTime = Date.now() - startTime;
  const wordCount = content.split(/\s+/).length;
  const languageRatio = calculateLanguageRatio(content);

  // Save to database
  const story = await prisma.story.create({
    data: {
      prompt: request.prompt,
      content: structuredContent.content,
      title: structuredContent.title,
      config: request.config as any,
      preferences: request.preferences as any,
      template_id: request.template_id,
      sections: structuredContent.sections as any,
      metadata: {
        word_count: wordCount,
        language_ratio: languageRatio,
        generation_time: generationTime,
        readability_score: calculateReadabilityScore(content),
      } as any,
      word_count: wordCount,
      language_ratio: languageRatio as any,
      generation_time: generationTime,
    },
  });

  return {
    ...story,
    sections: structuredContent.sections,
    metadata: {
      word_count: wordCount,
      language_ratio: languageRatio,
      generation_time: generationTime,
      readability_score: calculateReadabilityScore(content),
    },
  };
}

// Build enhanced prompt based on configuration
function buildEnhancedPrompt(request: StoryGenerationRequest): string {
  const { prompt, config, preferences } = request;

  let enhancedPrompt = `Create a story based on this prompt: "${prompt}"\n\n`;

  // Add language mixing instructions
  if (preferences.language_mix) {
    enhancedPrompt += `Language Requirements:
- Use ${preferences.language_mix.ratio}% Vietnamese and ${
      100 - preferences.language_mix.ratio
    }% English
- Base language: ${preferences.language_mix.base_language}
- Target language: ${preferences.language_mix.target_language}
${
  preferences.format.bold_english
    ? "- Make English words bold using **word** format"
    : ""
}

`;
  }

  // Add style instructions
  if (preferences.style) {
    enhancedPrompt += `Style Requirements:
- Storytelling style: ${preferences.style.storytelling}
- Tone: ${preferences.style.tone}
- Readability level: ${preferences.style.readability_level}

`;
  }

  // Add length requirements
  const lengthMap = {
    short: "150-250 words",
    medium: "250-400 words",
    long: "400-600 words",
  };
  enhancedPrompt += `Length: ${
    lengthMap[preferences.length] || "250-400 words"
  }\n\n`;

  // Add vocabulary focus
  if (config?.vocab_focus && config.vocab_focus.length > 0) {
    enhancedPrompt += `Key vocabulary to include: ${config.vocab_focus.join(
      ", "
    )}\n\n`;
  }

  // Add structure requirements
  if (preferences.structure) {
    enhancedPrompt += `Structure Requirements:
- Include these sections: ${preferences.structure.sections.join(", ")}
${
  preferences.structure.include_quiz
    ? "- Add a mini quiz with 3 multiple choice questions"
    : ""
}
${
  preferences.structure.include_glossary
    ? "- Include a glossary of key terms"
    : ""
}

`;
  }

  // Add core topic if available
  if (config?.core_topic) {
    enhancedPrompt += `Core topic focus: ${config.core_topic}\n\n`;
  }

  enhancedPrompt += `Please create an engaging story that follows all these requirements.`;

  return enhancedPrompt;
}

// Parse story content into structured sections
function parseStoryContent(content: string, preferences: StoryPreferences) {
  // Simple parsing - in a real implementation, you might use more sophisticated NLP
  const lines = content.split("\n").filter((line) => line.trim());

  let title = "";
  let storyContent = "";
  let moral = "";
  let quiz: any[] = [];
  let glossary: any[] = [];

  // Extract title (first line or line starting with #)
  const titleLine = lines.find(
    (line) => line.startsWith("#") || lines.indexOf(line) === 0
  );
  if (titleLine) {
    title = titleLine.replace(/^#+\s*/, "").trim();
  }

  // For now, treat the entire content as story content
  // In a real implementation, you would parse sections more intelligently
  storyContent = content;

  return {
    title: title || "Untitled Story",
    content: storyContent,
    sections: {
      story: storyContent,
      moral,
      quiz,
      glossary,
    },
  };
}

// Calculate language ratio in the content
function calculateLanguageRatio(content: string) {
  // Simple heuristic: count English vs Vietnamese characters
  const englishPattern = /[a-zA-Z]/g;
  const vietnamesePattern =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;

  const englishMatches = content.match(englishPattern) || [];
  const vietnameseMatches = content.match(vietnamesePattern) || [];

  const total = englishMatches.length + vietnameseMatches.length;
  if (total === 0) return { vi: 50, en: 50 };

  return {
    vi: Math.round((vietnameseMatches.length / total) * 100),
    en: Math.round((englishMatches.length / total) * 100),
  };
}

// Calculate readability score (simplified)
function calculateReadabilityScore(content: string): number {
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;

  // Simple readability score (lower is easier)
  // This is a very simplified version
  if (avgWordsPerSentence < 10) return 85; // Easy
  if (avgWordsPerSentence < 15) return 70; // Medium
  if (avgWordsPerSentence < 20) return 55; // Hard
  return 40; // Very hard
}

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
  const where: unknown = {};

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
