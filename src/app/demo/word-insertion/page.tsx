"use client";

import { useState } from "react";
import { generateStoryWithInsertion } from "@/lib/aiapi";
import type { StoryInsertionResponse } from "@/lib/aiapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WordInsertionDemo() {
  const [prompt, setPrompt] = useState(
    "Câu chuyện về một lập trình viên học AI"
  );
  const [topic, setTopic] = useState("technology");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [insertionCount, setInsertionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryInsertionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a story prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateStoryWithInsertion({
        prompt,
        config: {
          length: "medium",
          style: "narrative",
          tone: "friendly",
        },
        insertion_config: {
          topic,
          difficulty,
          insertion_count: insertionCount,
          bold_format: true,
          show_translation: true,
        },
      });

      setResult(response);

      if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate story");
    } finally {
      setLoading(false);
    }
  };

  const formatStoryContent = (content: string) => {
    // Convert **word (translation)** to highlighted format
    return content.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-semibold">$1</strong>'
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎯 Word Insertion Demo</h1>
        <p className="text-gray-600 text-lg">
          Search stories from database and intelligently insert English
          vocabulary words
        </p>
        <p className="text-sm text-gray-500 mt-1">
          💡 Enter keywords to find the most relevant story, then enhance it
          with vocabulary
        </p>
      </div>

      {/* Configuration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Story Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-sm">
                Search Keywords (e.g., "đi làm", "du lịch", "học tập")
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter keywords to search for stories..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll find the best matching story from our database
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Vocabulary Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="daily life">Daily Life</option>
                  <option value="travel">Travel</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm">
                  Word Count ({insertionCount})
                </label>
                <input
                  type="range"
                  value={insertionCount}
                  onChange={(e) => setInsertionCount(Number(e.target.value))}
                  min={5}
                  max={20}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full md:w-auto px-8 py-3 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Searching & Enhancing...
                </>
              ) : (
                <>🔍 Search Story & Insert Words</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-6">
          {/* Story Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{result.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-lg max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatStoryContent(result.enhanced_content),
                }}
              />
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Total Insertions
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {result.metrics.total_insertions}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Insertion Density
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {result.metrics.insertion_density.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Readability Score
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {result.metrics.readability_score}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Position Score
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    {result.metrics.avg_position_score.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-2">Language Ratio</div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vietnamese</span>
                      <span className="font-semibold">
                        {result.metrics.language_ratio.vi}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${result.metrics.language_ratio.vi}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>English</span>
                      <span className="font-semibold">
                        {result.metrics.language_ratio.en}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${result.metrics.language_ratio.en}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Glossary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Glossary ({result.glossary.length} words)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.glossary.map((entry, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-xl text-blue-600">
                        {entry.word}
                      </div>
                      {entry.ipa && (
                        <span className="text-sm text-gray-500 font-mono">
                          {entry.ipa}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-800 font-medium mb-2">
                      {entry.translation}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {entry.definition}
                    </div>
                    {entry.example && (
                      <div className="text-sm italic text-gray-500 border-l-2 border-blue-200 pl-3 mt-2">
                        "{entry.example}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ℹ️ Story Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Word Count</div>
                  <div className="font-semibold">
                    {result.metadata.word_count}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Generation Time</div>
                  <div className="font-semibold">
                    {result.metadata.generation_time}ms
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Readability</div>
                  <div className="font-semibold">
                    {result.metadata.readability_score}/100
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Language Mix</div>
                  <div className="font-semibold">
                    {result.metadata.language_ratio.vi}% VI /{" "}
                    {result.metadata.language_ratio.en}% EN
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
