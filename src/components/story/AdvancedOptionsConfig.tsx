"use client";

import { Palette, BookOpen, Target, Zap } from "lucide-react";
import { StoryPreferences } from "@/types/story";

interface AdvancedOptionsConfigProps {
  preferences: StoryPreferences;
  setPreferences: (
    preferences:
      | StoryPreferences
      | ((prev: StoryPreferences) => StoryPreferences)
  ) => void;
}

export default function AdvancedOptionsConfig({
  preferences,
  setPreferences,
}: AdvancedOptionsConfigProps) {
  const storytellingStyles = [
    {
      value: "Jewish-style",
      label: "Jewish Style",
      desc: "Wisdom through storytelling",
    },
    { value: "Western", label: "Western", desc: "Direct narrative approach" },
    {
      value: "Eastern",
      label: "Eastern",
      desc: "Philosophical and reflective",
    },
    { value: "Modern", label: "Modern", desc: "Contemporary storytelling" },
  ];

  const tones = [
    { value: "formal", label: "Formal", desc: "Professional and structured" },
    { value: "casual", label: "Casual", desc: "Relaxed and conversational" },
    { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
    { value: "professional", label: "Professional", desc: "Business-oriented" },
  ];

  const readabilityLevels = [
    {
      value: "A1",
      label: "A1 - Beginner",
      desc: "Very simple vocabulary and grammar",
    },
    {
      value: "A2",
      label: "A2 - Elementary",
      desc: "Basic everyday expressions",
    },
    {
      value: "B1",
      label: "B1 - Intermediate",
      desc: "Clear standard language",
    },
    {
      value: "B2",
      label: "B2 - Upper Intermediate",
      desc: "Complex topics and abstract ideas",
    },
    {
      value: "C1",
      label: "C1 - Advanced",
      desc: "Flexible and effective language use",
    },
    {
      value: "C2",
      label: "C2 - Proficient",
      desc: "Precise and nuanced expression",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Storytelling Style */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Storytelling Style
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {storytellingStyles.map((style) => (
            <label
              key={style.value}
              className="flex items-start cursor-pointer"
            >
              <input
                type="radio"
                name="storytelling"
                value={style.value}
                checked={preferences.style.storytelling === style.value}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    style: { ...prev.style, storytelling: e.target.value },
                  }))
                }
                className="mt-1 mr-3"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {style.label}
                </div>
                <div className="text-xs text-gray-600">{style.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Tone Selection */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Tone & Voice
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {tones.map((tone) => (
            <label key={tone.value} className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="tone"
                value={tone.value}
                checked={preferences.style.tone === tone.value}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    style: { ...prev.style, tone: e.target.value as any },
                  }))
                }
                className="mt-1 mr-3"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {tone.label}
                </div>
                <div className="text-xs text-gray-600">{tone.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Readability Level */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Readability Level
        </h4>
        <div className="space-y-2">
          {readabilityLevels.map((level) => (
            <label
              key={level.value}
              className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50"
            >
              <input
                type="radio"
                name="readability"
                value={level.value}
                checked={preferences.style.readability_level === level.value}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    style: { ...prev.style, readability_level: e.target.value },
                  }))
                }
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {level.label}
                </div>
                <div className="text-xs text-gray-600">{level.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Vocabulary Focus */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Vocabulary Focus
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Terms to Include
            </label>
            <textarea
              value={preferences.vocab_focus.join(", ")}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  vocab_focus: e.target.value
                    .split(",")
                    .map((term) => term.trim())
                    .filter((term) => term),
                }))
              }
              placeholder="Enter key terms separated by commas (e.g., refactor, pull request, code review)"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              These terms will be emphasized in the story. Separate multiple
              terms with commas.
            </p>
          </div>

          {/* Quick vocabulary presets */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Quick Presets:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    vocab_focus: [
                      "developer",
                      "code review",
                      "refactor",
                      "clean code",
                      "best practice",
                    ],
                  }))
                }
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                💻 Development
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    vocab_focus: [
                      "startup",
                      "pitch deck",
                      "investor",
                      "MVP",
                      "market fit",
                    ],
                  }))
                }
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                🚀 Startup
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    vocab_focus: [
                      "remote work",
                      "productivity",
                      "work-life balance",
                      "collaboration",
                    ],
                  }))
                }
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                🏠 Remote Work
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    vocab_focus: [
                      "agile",
                      "scrum",
                      "sprint",
                      "backlog",
                      "velocity",
                    ],
                  }))
                }
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                🔄 Agile
              </button>
            </div>
          </div>

          {/* Current vocabulary display */}
          {preferences.vocab_focus.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Current Focus Terms:
              </p>
              <div className="flex flex-wrap gap-1">
                {preferences.vocab_focus.map((term, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
