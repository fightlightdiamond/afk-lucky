"use client";

import { useState } from "react";
import { searchVocabulary, getVocabularyByTopic } from "@/lib/aiapi";
import type { VocabularyWord } from "@/lib/aiapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VocabularySearchDemo() {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [results, setResults] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"semantic" | "browse">(
    "semantic"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSemanticSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const words = await searchVocabulary(query, {
        topic: selectedTopic || undefined,
        difficulty: selectedDifficulty || undefined,
        limit: 20,
      });
      setResults(words);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseByTopic = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      alert("Please select both topic and difficulty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const words = await getVocabularyByTopic(
        selectedTopic,
        selectedDifficulty,
        20
      );
      setResults(words);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch vocabulary"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === "semantic") {
      handleSemanticSearch();
    } else {
      handleBrowseByTopic();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchType === "semantic") {
      handleSemanticSearch();
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          🔍 Semantic Vocabulary Search
        </h1>
        <p className="text-gray-600 text-lg">
          RAG-powered vocabulary search using vector embeddings and ChromaDB
        </p>
      </div>

      {/* Search Type Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={searchType === "semantic" ? "default" : "outline"}
              onClick={() => setSearchType("semantic")}
              className="flex-1"
            >
              🔍 Semantic Search
            </Button>
            <Button
              variant={searchType === "browse" ? "default" : "outline"}
              onClick={() => setSearchType("browse")}
              className="flex-1"
            >
              📚 Browse by Topic
            </Button>
          </div>

          {searchType === "semantic" ? (
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Search Query (Natural Language)
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., words about programming and computers..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Try: "words about learning", "technology terms", "business
                  vocabulary"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-sm">
                    Filter by Topic (Optional)
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Topics</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="daily life">Daily Life</option>
                    <option value="travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2 text-sm">
                    Filter by Difficulty (Optional)
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Topic *
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Topic</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="daily life">Daily Life</option>
                  <option value="travel">Travel</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm">
                  Difficulty *
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={
              loading ||
              (searchType === "semantic" && !query.trim()) ||
              (searchType === "browse" &&
                (!selectedTopic || !selectedDifficulty))
            }
            className="w-full md:w-auto px-8 py-3 text-lg mt-4"
            size="lg"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Searching...
              </>
            ) : (
              <>{searchType === "semantic" ? "🔍 Search" : "📚 Browse"}</>
            )}
          </Button>
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
      {results.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Found {results.length} words</h2>
            {searchType === "semantic" && (
              <span className="text-sm text-gray-600">
                Sorted by relevance (semantic similarity)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((word, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-bold text-2xl text-blue-600">
                      {word.word}
                    </div>
                    {word.similarity !== undefined && (
                      <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                        {(word.similarity * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {word.ipa && (
                    <div className="text-sm text-gray-500 font-mono mb-2">
                      {word.ipa}
                    </div>
                  )}

                  <div className="text-gray-800 font-medium mb-2">
                    {word.vietnamese_translation}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    {word.definition}
                  </div>

                  {word.example && (
                    <div className="text-sm italic text-gray-500 border-l-2 border-blue-200 pl-3 mb-3">
                      "{word.example}"
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      {word.topic}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                      {word.difficulty}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                      {word.part_of_speech}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No results yet</h3>
            <p className="text-gray-600">
              {searchType === "semantic"
                ? "Enter a search query to find relevant vocabulary using semantic search"
                : "Select a topic and difficulty to browse vocabulary"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
