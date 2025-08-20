"use client";

import { Globe } from "lucide-react";
import { StoryPreferences } from "@/types/story";

interface LanguageMixConfigProps {
  preferences: StoryPreferences;
  setPreferences: (
    preferences:
      | StoryPreferences
      | ((prev: StoryPreferences) => StoryPreferences)
  ) => void;
}

export default function LanguageMixConfig({
  preferences,
  setPreferences,
}: LanguageMixConfigProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
        <Globe className="w-4 h-4 mr-2" />
        Language Mix Configuration
      </h4>
      <div className="space-y-4">
        {/* Language Ratio Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Language Ratio
            </label>
            <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              🇻🇳 {preferences.language_mix.ratio}% - 🇺🇸{" "}
              {100 - preferences.language_mix.ratio}%
            </div>
          </div>

          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={preferences.language_mix.ratio}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                language_mix: {
                  ...prev.language_mix,
                  ratio: parseInt(e.target.value),
                },
              }))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${preferences.language_mix.ratio}%, #d1d5db ${preferences.language_mix.ratio}%, #d1d5db 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>🇺🇸 More English (30%)</span>
            <span>🇻🇳 More Vietnamese (90%)</span>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: { ...prev.language_mix, ratio: 50 },
                }))
              }
              className={`px-3 py-1 text-xs rounded transition-colors ${
                preferences.language_mix.ratio === 50
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              50/50 Balanced
            </button>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: { ...prev.language_mix, ratio: 70 },
                }))
              }
              className={`px-3 py-1 text-xs rounded transition-colors ${
                preferences.language_mix.ratio === 70
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              70/30 VI Focus
            </button>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: { ...prev.language_mix, ratio: 40 },
                }))
              }
              className={`px-3 py-1 text-xs rounded transition-colors ${
                preferences.language_mix.ratio === 40
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              40/60 EN Focus
            </button>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: { ...prev.language_mix, ratio: 80 },
                }))
              }
              className={`px-3 py-1 text-xs rounded transition-colors ${
                preferences.language_mix.ratio === 80
                  ? "bg-purple-500 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              80/20 VI Heavy
            </button>
          </div>
        </div>

        {/* Base and Target Language Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Language (Primary)
            </label>
            <select
              value={preferences.language_mix.base_language}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: {
                    ...prev.language_mix,
                    base_language: e.target.value as "vi" | "en",
                  },
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="vi">🇻🇳 Vietnamese</option>
              <option value="en">🇺🇸 English</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Main language for the story
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Language (Mixed)
            </label>
            <select
              value={preferences.language_mix.target_language}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  language_mix: {
                    ...prev.language_mix,
                    target_language: e.target.value as "vi" | "en",
                  },
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="en">🇺🇸 English</option>
              <option value="vi">🇻🇳 Vietnamese</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Language to mix in</p>
          </div>
        </div>

        {/* Formatting Options */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">
            Formatting Options
          </h5>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.format.bold_english}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    format: {
                      ...prev.format,
                      bold_english: e.target.checked,
                    },
                  }))
                }
                className="mr-2 rounded"
              />
              <span className="text-sm">
                Make <strong>English words</strong> bold for emphasis
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.format.markdown}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    format: {
                      ...prev.format,
                      markdown: e.target.checked,
                    },
                  }))
                }
                className="mr-2 rounded"
              />
              <span className="text-sm">
                Use Markdown formatting (headers, lists, etc.)
              </span>
            </label>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
          <h6 className="text-xs font-medium text-blue-800 mb-2 flex items-center">
            👁️ Live Preview:
          </h6>
          <div className="text-sm text-gray-800 leading-relaxed">
            {preferences.language_mix.ratio >= 80 ? (
              <p>
                Anh ấy là một{" "}
                {preferences.format.bold_english ? (
                  <strong>developer</strong>
                ) : (
                  "developer"
                )}{" "}
                tài năng, luôn viết{" "}
                {preferences.format.bold_english ? (
                  <strong>clean code</strong>
                ) : (
                  "clean code"
                )}{" "}
                và thực hiện{" "}
                {preferences.format.bold_english ? (
                  <strong>code review</strong>
                ) : (
                  "code review"
                )}{" "}
                cẩn thận. Trong mỗi{" "}
                {preferences.format.bold_english ? (
                  <strong>sprint</strong>
                ) : (
                  "sprint"
                )}
                , anh ấy đều đạt được{" "}
                {preferences.format.bold_english ? (
                  <strong>velocity</strong>
                ) : (
                  "velocity"
                )}{" "}
                cao.
              </p>
            ) : preferences.language_mix.ratio >= 60 ? (
              <p>
                Anh ấy là một{" "}
                {preferences.format.bold_english ? (
                  <strong>developer</strong>
                ) : (
                  "developer"
                )}{" "}
                giỏi, always writes{" "}
                {preferences.format.bold_english ? (
                  <strong>clean code</strong>
                ) : (
                  "clean code"
                )}{" "}
                và performs careful{" "}
                {preferences.format.bold_english ? (
                  <strong>reviews</strong>
                ) : (
                  "reviews"
                )}
                . Trong mỗi{" "}
                {preferences.format.bold_english ? (
                  <strong>sprint</strong>
                ) : (
                  "sprint"
                )}
                , he achieves high{" "}
                {preferences.format.bold_english ? (
                  <strong>velocity</strong>
                ) : (
                  "velocity"
                )}
                .
              </p>
            ) : preferences.language_mix.ratio >= 40 ? (
              <p>
                He is a talented{" "}
                {preferences.format.bold_english ? (
                  <strong>developer</strong>
                ) : (
                  "developer"
                )}
                , anh ấy luôn writes{" "}
                {preferences.format.bold_english ? (
                  <strong>clean code</strong>
                ) : (
                  "clean code"
                )}
                and performs careful{" "}
                {preferences.format.bold_english ? (
                  <strong>reviews</strong>
                ) : (
                  "reviews"
                )}
                . In every{" "}
                {preferences.format.bold_english ? (
                  <strong>sprint</strong>
                ) : (
                  "sprint"
                )}
                , anh ấy achieves high{" "}
                {preferences.format.bold_english ? (
                  <strong>velocity</strong>
                ) : (
                  "velocity"
                )}
                .
              </p>
            ) : (
              <p>
                He is a talented{" "}
                {preferences.format.bold_english ? (
                  <strong>developer</strong>
                ) : (
                  "developer"
                )}
                who always writes{" "}
                {preferences.format.bold_english ? (
                  <strong>clean code</strong>
                ) : (
                  "clean code"
                )}
                and performs careful{" "}
                {preferences.format.bold_english ? (
                  <strong>code reviews</strong>
                ) : (
                  "code reviews"
                )}
                . In every{" "}
                {preferences.format.bold_english ? (
                  <strong>sprint</strong>
                ) : (
                  "sprint"
                )}
                , he achieves high{" "}
                {preferences.format.bold_english ? (
                  <strong>velocity</strong>
                ) : (
                  "velocity"
                )}
                và delivers quality work.
              </p>
            )}
          </div>

          {/* Ratio explanation */}
          <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
            <strong>Current setting:</strong> {preferences.language_mix.ratio}%{" "}
            {preferences.language_mix.base_language.toUpperCase()},{" "}
            {100 - preferences.language_mix.ratio}%{" "}
            {preferences.language_mix.target_language.toUpperCase()}
            {preferences.language_mix.ratio >= 70 &&
              " - Vietnamese dominant with English technical terms"}
            {preferences.language_mix.ratio >= 50 &&
              preferences.language_mix.ratio < 70 &&
              " - Balanced mix with code-switching"}
            {preferences.language_mix.ratio < 50 &&
              " - English dominant with Vietnamese phrases"}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h6 className="text-xs font-medium text-yellow-800 mb-1">💡 Tips:</h6>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>
              • <strong>70-80%</strong>: Best for Vietnamese learners practicing
              English
            </li>
            <li>
              • <strong>50-60%</strong>: Natural code-switching for bilingual
              speakers
            </li>
            <li>
              • <strong>30-40%</strong>: English-focused with Vietnamese
              cultural context
            </li>
            <li>• Bold formatting helps distinguish languages visually</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
