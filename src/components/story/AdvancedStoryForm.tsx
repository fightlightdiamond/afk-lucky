"use client";

import { useState, useEffect } from "react";
import { StoryPreferences, StoryTemplate } from "@/types/story";
import {
  storyTemplates,
  getTemplatesByCategory,
  getPopularTemplates,
} from "@/data/storyTemplates";
import {
  useUserPreferences,
  useFavoriteTemplates,
  useAutoSavePreferences,
} from "@/hooks/useUserPreferences";
import {
  Settings,
  BookOpen,
  Zap,
  Globe,
  Palette,
  FileText,
  HelpCircle,
  Heart,
  Save,
} from "lucide-react";
import StoryLoadingStages from "./StoryLoadingStages";
import MagicalLoader from "./MagicalLoader";
import SmartProgressLoader from "./SmartProgressLoader";
import InteractiveLoader from "./InteractiveLoader";
import LanguageMixConfig from "./LanguageMixConfig";
import AdvancedOptionsConfig from "./AdvancedOptionsConfig";
import StoryConfigSummary from "./StoryConfigSummary";
import TemplateCard from "./TemplateCard";
import PreferencesStatus from "./PreferencesStatus";
import ClickToSpeak from "./ClickToSpeak";
import AIAPIStatus from "./AIAPIStatus";
import { useGenerateAdvancedStory } from "@/hooks/useAdvancedStories";

export default function AdvancedStoryForm() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Use the new advanced story generation hook
  const generateStoryMutation = useGenerateAdvancedStory();

  // UI States
  const [activeTab, setActiveTab] = useState<
    "templates" | "custom" | "preferences"
  >("templates");
  const [loadingStyle, setLoadingStyle] = useState<
    "stages" | "magical" | "smart" | "interactive"
  >("interactive");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // User Preferences & Favorites
  const {
    preferences: savedPreferences,
    isDefault,
    savePreferences,
    isSaving,
    sessionId,
    userId,
  } = useUserPreferences();

  const {
    favorites,
    addFavorite,
    removeFavorite,
    isAddingFavorite,
    isRemovingFavorite,
  } = useFavoriteTemplates();

  // Story Configuration
  const [selectedTemplate, setSelectedTemplate] =
    useState<StoryTemplate | null>(null);
  const [preferences, setPreferences] = useState<StoryPreferences>({
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
  });

  // Auto-save preferences
  useAutoSavePreferences(preferences, selectedTemplate?.id);

  // Load saved preferences on mount
  useEffect(() => {
    if (savedPreferences && !isDefault) {
      setPreferences(savedPreferences);
    }
  }, [savedPreferences, isDefault]);

  const handleTemplateSelect = (template: StoryTemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.config.core_topic || "");

    // Update preferences based on template
    if (template.config.language_mix) {
      setPreferences((prev) => ({
        ...prev,
        language_mix: {
          ...prev.language_mix,
          base_language: template.config.language_mix!.base_language,
          target_language: template.config.language_mix!.target_language,
          ratio: Math.round(template.config.language_mix!.ratio.vi * 100),
        },
      }));
    }

    if (template.config.style) {
      setPreferences((prev) => ({
        ...prev,
        style: {
          storytelling:
            template.config.style!.storytelling || prev.style.storytelling,
          tone: template.config.style!.tone || prev.style.tone,
          readability_level:
            template.config.style!.readability_level ||
            prev.style.readability_level,
        },
      }));
    }

    if (template.config.vocab_focus) {
      setPreferences((prev) => ({
        ...prev,
        vocab_focus: template.config.vocab_focus || [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStory("");

    try {
      const requestData = {
        prompt,
        preferences,
        template_id: selectedTemplate?.id,
        config: selectedTemplate?.config,
        user_id: userId,
        session_id: sessionId,
      };

      const result = await generateStoryMutation.mutateAsync(requestData);

      if (result.content) {
        setStory(result.content);
        fetchHistory();
      } else {
        setStory("Không tạo được nội dung.");
      }
    } catch (err) {
      setStory("Đã xảy ra lỗi khi tạo truyện.");
      console.error("Story generation error:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/stories");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const popularTemplates = getPopularTemplates();
  const categories = ["tech", "business", "life", "education"];

  return (
    <>
      {/* Loading overlays */}
      {loadingStyle === "stages" && (
        <StoryLoadingStages isLoading={generateStoryMutation.isPending} />
      )}
      {loadingStyle === "magical" && (
        <MagicalLoader isLoading={generateStoryMutation.isPending} />
      )}
      {loadingStyle === "smart" && (
        <SmartProgressLoader
          isLoading={generateStoryMutation.isPending}
          estimatedTime={45}
        />
      )}
      {loadingStyle === "interactive" && (
        <InteractiveLoader isLoading={generateStoryMutation.isPending} />
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ✨ Advanced Story Generator
          </h1>
          <p className="text-gray-600">
            Tạo truyện với cấu hình nâng cao và templates chuyên nghiệp
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "templates"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "custom"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Custom
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "preferences"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Preferences
              </button>
            </div>

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div className="space-y-6">
                {/* Popular Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🔥 Popular Templates
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {popularTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate?.id === template.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {template.category}
                              </span>
                              {template.popular && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    📚 All Categories
                  </h3>
                  {categories.map((category) => {
                    const categoryTemplates = getTemplatesByCategory(category);
                    return (
                      <div key={category} className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3 capitalize">
                          {category === "tech" && "💻"}
                          {category === "business" && "💼"}
                          {category === "life" && "🌱"}
                          {category === "education" && "📚"}
                          {category}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {categoryTemplates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => handleTemplateSelect(template)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedTemplate?.id === template.id
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200 hover:border-purple-300"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{template.icon}</span>
                                <div>
                                  <h5 className="font-medium text-gray-800 text-sm">
                                    {template.name}
                                  </h5>
                                  <p className="text-xs text-gray-600">
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Tab */}
            {activeTab === "custom" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    placeholder="Nhập ý tưởng truyện của bạn..."
                    disabled={generateStoryMutation.isPending}
                  />
                </div>

                {/* Quick Settings */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Story Length
                    </label>
                    <select
                      value={preferences.length}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          length: e.target.value as any,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="short">Short (150-250 words)</option>
                      <option value="medium">Medium (250-400 words)</option>
                      <option value="long">Long (400-600 words)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={preferences.style.tone}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          style: { ...prev.style, tone: e.target.value as any },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                {/* Language Mix Configuration */}
                <LanguageMixConfig
                  preferences={preferences}
                  setPreferences={setPreferences}
                />

                {/* Story Structure */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Story Structure
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.structure.include_quiz}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            structure: {
                              ...prev.structure,
                              include_quiz: e.target.checked,
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Include Mini Quiz</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.structure.include_glossary}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            structure: {
                              ...prev.structure,
                              include_glossary: e.target.checked,
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Include Glossary</span>
                    </label>
                  </div>
                </div>

                {/* Readability Level */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Readability Level
                  </h4>
                  <select
                    value={preferences.style.readability_level}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        style: {
                          ...prev.style,
                          readability_level: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficient</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="submit"
                disabled={generateStoryMutation.isPending || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {generateStoryMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Story...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    ✨ Generate Advanced Story
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel - Settings & Preview */}
          <div className="space-y-6">
            {/* AI API Status */}
            <AIAPIStatus />

            {/* Loading Style Selector */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">
                🎨 Loading Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "interactive",
                    name: "🎮 Interactive",
                    desc: "Click to add energy",
                  },
                  { id: "smart", name: "🧠 Smart", desc: "Progress tracking" },
                  {
                    id: "magical",
                    name: "✨ Magical",
                    desc: "Particle effects",
                  },
                  { id: "stages", name: "📋 Stages", desc: "Step by step" },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setLoadingStyle(style.id as any)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      loadingStyle === style.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                    }`}
                    title={style.desc}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="mr-2">{selectedTemplate.icon}</span>
                  Selected Template
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  {selectedTemplate.name}
                </p>
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
              <h3 className="font-semibold text-gray-800 mb-3">
                ⚙️ Current Settings
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Language Mix:</span>
                  <span className="font-medium">
                    {preferences.language_mix.ratio}% VI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Length:</span>
                  <span className="font-medium capitalize">
                    {preferences.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tone:</span>
                  <span className="font-medium capitalize">
                    {preferences.style.tone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">
                    {preferences.style.readability_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz:</span>
                  <span className="font-medium">
                    {preferences.structure.include_quiz ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Glossary:</span>
                  <span className="font-medium">
                    {preferences.structure.include_glossary ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Story Display */}
        {story && (
          <div className="mt-8 p-6 border-2 border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-2 rounded-full mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                ✨ Your Story is Ready!
              </h3>
            </div>
            <div className="whitespace-pre-line text-gray-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <ClickToSpeak text={story} />
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📜 Story History</h2>
            <button
              onClick={fetchHistory}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              🔄 Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-lg mb-2">📭 No stories yet</p>
              <p className="text-sm">Create your first story!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {history.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600 font-medium">
                      <span className="italic">
                        "{s.prompt?.substring(0, 50)}..."
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(s.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                    {s.content?.substring(0, 150)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
