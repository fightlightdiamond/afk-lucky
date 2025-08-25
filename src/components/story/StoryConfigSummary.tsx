"use client";

import {
  Settings,
  Globe,
  Palette,
  BookOpen,
  Target,
  FileText,
} from "lucide-react";
import { StoryPreferences, StoryTemplate } from "@/types/story";

interface StoryConfigSummaryProps {
  preferences: StoryPreferences;
  selectedTemplate: StoryTemplate | null;
  loadingStyle: string;
}

export default function StoryConfigSummary({
  preferences,
  selectedTemplate,
  loadingStyle,
}: StoryConfigSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">{selectedTemplate.icon}</span>
            Selected Template
          </h3>
          <p className="text-sm text-blue-700 mb-2">{selectedTemplate.name}</p>
          <p className="text-xs text-blue-600">
            {selectedTemplate.description}
          </p>

          {selectedTemplate.config.vocab_focus && (
            <div className="mt-3">
              <p className="text-xs font-medium text-blue-800 mb-1">
                Key Vocabulary:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.config.vocab_focus
                  .slice(0, 4)
                  .map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {word}
                    </span>
                  ))}
                {selectedTemplate.config.vocab_focus.length > 4 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    +{selectedTemplate.config.vocab_focus.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Settings Summary */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Current Configuration
        </h3>
        <div className="space-y-3 text-sm">
          {/* Language Mix */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-2 text-gray-500" />
              <span className="text-gray-600">Language Mix:</span>
            </div>
            <div className="text-right">
              <div className="font-medium">
                🇻🇳 {preferences.language_mix.ratio}% - 🇺🇸{" "}
                {100 - preferences.language_mix.ratio}%
              </div>
              <div className="text-xs text-gray-500">
                {preferences.language_mix.base_language.toUpperCase()} →{" "}
                {preferences.language_mix.target_language.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Palette className="w-3 h-3 mr-2 text-gray-500" />
              <span className="text-gray-600">Style:</span>
            </div>
            <div className="text-right">
              <div className="font-medium capitalize">
                {preferences.style.storytelling}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {preferences.style.tone} tone
              </div>
            </div>
          </div>

          {/* Length & Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-3 h-3 mr-2 text-gray-500" />
              <span className="text-gray-600">Length & Level:</span>
            </div>
            <div className="text-right">
              <div className="font-medium capitalize">{preferences.length}</div>
              <div className="text-xs text-gray-500">
                {preferences.style.readability_level} Level
              </div>
            </div>
          </div>

          {/* Structure */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-3 h-3 mr-2 text-gray-500" />
              <span className="text-gray-600">Structure:</span>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {preferences.structure.include_quiz &&
                preferences.structure.include_glossary
                  ? "Quiz + Glossary"
                  : preferences.structure.include_quiz
                  ? "Quiz Only"
                  : preferences.structure.include_glossary
                  ? "Glossary Only"
                  : "Story Only"}
              </div>
            </div>
          </div>

          {/* Vocabulary Focus */}
          {preferences.vocab_focus.length > 0 && (
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Target className="w-3 h-3 mr-2 text-gray-500 mt-0.5" />
                <span className="text-gray-600">Focus Terms:</span>
              </div>
              <div className="text-right max-w-32">
                <div className="flex flex-wrap gap-1 justify-end">
                  {preferences.vocab_focus.slice(0, 3).map((term, index) => (
                    <span
                      key={index}
                      className="px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {term}
                    </span>
                  ))}
                  {preferences.vocab_focus.length > 3 && (
                    <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                      +{preferences.vocab_focus.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formatting */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Formatting:</span>
            <div className="text-right">
              <div className="font-medium">
                {preferences.format.bold_english && preferences.format.markdown
                  ? "Bold EN + Markdown"
                  : preferences.format.bold_english
                  ? "Bold English"
                  : preferences.format.markdown
                  ? "Markdown"
                  : "Plain Text"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Style */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-2">
          🎨 Loading Experience
        </h3>
        <div className="text-sm text-purple-700">
          <span className="font-medium capitalize">{loadingStyle}</span> style
          {loadingStyle === "interactive" && " - Click to add energy"}
          {loadingStyle === "smart" && " - Progress tracking"}
          {loadingStyle === "magical" && " - Particle effects"}
          {loadingStyle === "stages" && " - Step by step"}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">
            {preferences.length === "short"
              ? "150-250"
              : preferences.length === "medium"
              ? "250-400"
              : "400-600"}
          </div>
          <div className="text-xs text-green-600">Expected Words</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">
            {preferences.style.readability_level}
          </div>
          <div className="text-xs text-blue-600">Difficulty Level</div>
        </div>
      </div>

      {/* Tips based on current config */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 Tip:</h4>
        <p className="text-xs text-yellow-700">
          {preferences.language_mix.ratio >= 70
            ? "High Vietnamese ratio is great for language learners practicing English vocabulary."
            : preferences.language_mix.ratio >= 50
            ? "Balanced language mix creates natural code-switching scenarios."
            : "English-focused stories help with immersion while maintaining cultural context."}
        </p>
      </div>
    </div>
  );
}
