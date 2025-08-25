import { StoryTemplate } from "@/types/story";

export const storyTemplates: StoryTemplate[] = [
  {
    id: "dev-code-review",
    name: "Code Review Story",
    description:
      "Câu chuyện về developer học cách nhận feedback và refactor code",
    icon: "👨‍💻",
    category: "tech",
    popular: true,
    config: {
      meta: {
        task: "generate_vi-en_code_switching_story",
        version: "1.0",
      },
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.7, en: 0.3 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Jewish-style",
        tone: "ấm áp, khích lệ, thẳng thắn",
        pacing: "bối cảnh → xung đột → chiêm nghiệm → bài học",
        readability_level: "A2",
      },
      core_topic:
        "Developer nhận feedback code review và học cách refactor có chủ đích",
      vocab_focus: [
        "refactor",
        "pull request",
        "readability",
        "code smell",
        "feedback",
        "best practice",
        "trade-off",
        "deadline",
      ],
      length: { min_words: 200, max_words: 300 },
      structure: {
        sections: ["title", "story", "moral", "mini_quiz", "glossary"],
        mini_quiz_rules: { count: 3, type: "MCQ A-D", show_answers: true },
        glossary_rules: { items: 6 },
      },
    },
  },
  {
    id: "startup-pitch",
    name: "Startup Pitch Story",
    description: "Câu chuyện về entrepreneur chuẩn bị pitch deck",
    icon: "🚀",
    category: "business",
    popular: true,
    config: {
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.6, en: 0.4 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Modern",
        tone: "năng động, truyền cảm hứng",
        readability_level: "B1",
      },
      core_topic: "Entrepreneur học cách tạo pitch deck thuyết phục investor",
      vocab_focus: [
        "pitch deck",
        "investor",
        "valuation",
        "market size",
        "traction",
        "MVP",
        "burn rate",
        "runway",
      ],
      length: { min_words: 250, max_words: 400 },
    },
  },
  {
    id: "remote-work",
    name: "Remote Work Story",
    description: "Câu chuyện về thách thức làm việc từ xa",
    icon: "🏠",
    category: "life",
    popular: false,
    config: {
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.8, en: 0.2 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Western",
        tone: "thân thiện, chia sẻ",
        readability_level: "A2",
      },
      core_topic: "Nhân viên học cách làm việc hiệu quả từ xa",
      vocab_focus: [
        "remote work",
        "work-life balance",
        "productivity",
        "communication",
        "time management",
        "collaboration",
      ],
      length: { min_words: 180, max_words: 280 },
    },
  },
  {
    id: "data-science",
    name: "Data Science Story",
    description: "Câu chuyện về data scientist phân tích dữ liệu",
    icon: "📊",
    category: "tech",
    popular: false,
    config: {
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.5, en: 0.5 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Modern",
        tone: "khoa học, logic",
        readability_level: "B2",
      },
      core_topic: "Data scientist khám phá insights từ dữ liệu phức tạp",
      vocab_focus: [
        "machine learning",
        "dataset",
        "algorithm",
        "visualization",
        "correlation",
        "regression",
        "clustering",
        "prediction",
      ],
      length: { min_words: 300, max_words: 450 },
    },
  },
  {
    id: "agile-scrum",
    name: "Agile Scrum Story",
    description: "Câu chuyện về team áp dụng Agile methodology",
    icon: "🔄",
    category: "business",
    popular: true,
    config: {
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.65, en: 0.35 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Jewish-style",
        tone: "hợp tác, học hỏi",
        readability_level: "B1",
      },
      core_topic: "Development team học cách làm việc theo Agile Scrum",
      vocab_focus: [
        "sprint",
        "backlog",
        "user story",
        "retrospective",
        "daily standup",
        "velocity",
        "burndown chart",
        "product owner",
      ],
      length: { min_words: 220, max_words: 350 },
    },
  },
  {
    id: "english-learning",
    name: "English Learning Story",
    description: "Câu chuyện về hành trình học tiếng Anh",
    icon: "📚",
    category: "education",
    popular: false,
    config: {
      language_mix: {
        base_language: "vi",
        target_language: "en",
        ratio: { vi: 0.75, en: 0.25 },
        formatting: { english_bold: true },
      },
      style: {
        storytelling: "Eastern",
        tone: "động viên, kiên trì",
        readability_level: "A2",
      },
      core_topic: "Người học tiếng Anh vượt qua khó khăn để đạt mục tiêu",
      vocab_focus: [
        "fluency",
        "pronunciation",
        "vocabulary",
        "grammar",
        "listening skills",
        "speaking practice",
      ],
      length: { min_words: 200, max_words: 300 },
    },
  },
];

export const getTemplateById = (id: string): StoryTemplate | undefined => {
  return storyTemplates.find((template) => template.id === id);
};

export const getTemplatesByCategory = (category: string): StoryTemplate[] => {
  return storyTemplates.filter((template) => template.category === category);
};

export const getPopularTemplates = (): StoryTemplate[] => {
  return storyTemplates.filter((template) => template.popular);
};
