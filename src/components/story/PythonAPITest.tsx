"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Zap } from "lucide-react";

interface TestResult {
  endpoint: string;
  status: "success" | "error" | "pending";
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function PythonAPITest() {
  const [prompt, setPrompt] = useState(
    "Write a short story about a brave mouse"
  );
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      {
        name: "Health Check",
        endpoint: "/health",
        method: "GET",
        baseUrl:
          process.env.NEXT_PUBLIC_AI_API_URL?.replace("/api/v1", "") ||
          "http://localhost:8000",
      },
      {
        name: "Simple Story Generation",
        endpoint: "/api/v1/generate-story",
        method: "POST",
        baseUrl:
          process.env.NEXT_PUBLIC_AI_API_URL?.replace("/api/v1", "") ||
          "http://localhost:8000",
        body: { prompt },
      },
      {
        name: "Advanced Story Generation",
        endpoint: "/api/v1/generate-advanced-story",
        method: "POST",
        baseUrl:
          process.env.NEXT_PUBLIC_AI_API_URL?.replace("/api/v1", "") ||
          "http://localhost:8000",
        body: {
          prompt,
          preferences: {
            length: "medium",
            language_mix: {
              ratio: 70,
              base_language: "vi",
              target_language: "en",
            },
            style: {
              storytelling: "narrative",
              tone: "friendly",
              readability_level: "intermediate",
            },
          },
        },
      },
      {
        name: "Chat API",
        endpoint: "/api/v1/chat",
        method: "POST",
        baseUrl:
          process.env.NEXT_PUBLIC_AI_API_URL?.replace("/api/v1", "") ||
          "http://localhost:8000",
        body: {
          content: "Hello, can you help me write a story?",
          context: "You are a helpful writing assistant",
        },
      },
    ];

    for (const test of tests) {
      const startTime = Date.now();

      try {
        setResults((prev) => [
          ...prev,
          {
            endpoint: test.name,
            status: "pending",
          },
        ]);

        const response = await fetch(`${test.baseUrl}${test.endpoint}`, {
          method: test.method,
          headers: test.body ? { "Content-Type": "application/json" } : {},
          body: test.body ? JSON.stringify(test.body) : undefined,
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        setResults((prev) =>
          prev.map((result) =>
            result.endpoint === test.name
              ? {
                  ...result,
                  status: response.ok ? "success" : "error",
                  data: response.ok ? data : undefined,
                  error: response.ok
                    ? undefined
                    : `${response.status}: ${
                        data.detail || response.statusText
                      }`,
                  responseTime,
                }
              : result
          )
        );
      } catch (error) {
        const responseTime = Date.now() - startTime;

        setResults((prev) =>
          prev.map((result) =>
            result.endpoint === test.name
              ? {
                  ...result,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  responseTime,
                }
              : result
          )
        );
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Python AI API Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Prompt:</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to test story generation..."
            rows={3}
          />
        </div>

        <Button
          onClick={runTests}
          disabled={isRunning || !prompt.trim()}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run API Tests"
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.status === "pending" && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {result.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {result.status === "error" && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.responseTime && (
                      <Badge variant="outline">{result.responseTime}ms</Badge>
                    )}
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>

                {result.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}

                {result.data && (
                  <div className="text-sm bg-gray-50 p-2 rounded mt-2">
                    <strong>Response:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> Make sure the Python AI backend is running on
          port 8000:
          <code className="block mt-1 bg-gray-100 p-1 rounded">
            cd aiapi && python run.py
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
