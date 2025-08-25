// Story generation configuration types
export interface StoryConfig {
  meta: {
    task: string;
    version: string;
  };
  guardrails: {
    stay_on_topic: boolean;
    reject_if_off_topic: string;
    facts_policy: string;
    appropriateness: string;
    hallucination_control: string;
  };
  language_mix: {
    base_language: "vi" | "en";
    target_language: "vi" | "en";
    ratio: {
      vi: number;
      en: number;
    };
    formatting: {
      english_bold: boolean;
    };
  };
  style: {
    storytelling: "Jewish-style" | "Western" | "Eastern" | "Modern";
    tone: string;
    pacing: string;
    readability_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  };
  core_topic: string;
  vocab_focus: string[];
  length: {
    min_words: number;
    max_words: number;
  };
  structure: {
    sections: string[];
    mini_quiz_rules: {
      count: number;
      type: string;
      show_answers: boolean;
    };
    glossary_rules: {
      items: number;
    };
  };
  format_constraints: {
    markdown: boolean;
    bold_english_only: boolean;
  };
}

// Predefined story templates
export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "tech" | "business" | "life" | "education";
  config: Partial<StoryConfig>;
  popular: boolean;
}

// User story preferences
export interface StoryPreferences {
  language_mix: {
    base_language: "vi" | "en";
    target_language: "vi" | "en";
    ratio: number; // 0-100, percentage of base language
  };
  style: {
    storytelling: string;
    tone: "formal" | "casual" | "friendly" | "professional";
    readability_level: string;
  };
  length: "short" | "medium" | "long";
  structure: {
    include_quiz: boolean;
    include_glossary: boolean;
    sections: string[];
  };
  vocab_focus: string[];
  format: {
    markdown: boolean;
    bold_english: boolean;
  };
}

// Story generation request
export interface StoryGenerationRequest {
  prompt: string;
  config: StoryConfig;
  preferences: StoryPreferences;
  template_id?: string;
}

// Story response
export interface StoryResponse {
  id: string;
  title: string;
  content: string;
  sections: {
    story: string;
    moral?: string;
    quiz?: QuizQuestion[];
    glossary?: GlossaryItem[];
  };
  metadata: {
    word_count: number;
    language_ratio: {
      vi: number;
      en: number;
    };
    readability_score: number;
    generation_time: number;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
  example?: string;
}
