/**
 * AI API client for calling the Python backend services
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000/api/v1";

// Story generation types
export interface StoryRequest {
  prompt: string;
}

export interface AdvancedStoryRequest {
  prompt: string;
  config?: {
    vocab_focus?: string[];
    core_topic?: string;
  };
  preferences?: {
    length?: "short" | "medium" | "long";
    language_mix?: {
      ratio: number;
      base_language: "vi" | "en";
      target_language: "vi" | "en";
    };
    style?: {
      storytelling: "narrative" | "dialogue" | "descriptive" | "mixed";
      tone: "friendly" | "formal" | "casual" | "educational" | "entertaining";
      readability_level: "beginner" | "intermediate" | "advanced";
    };
    format?: {
      bold_english: boolean;
    };
    structure?: {
      sections: string[];
      include_quiz: boolean;
      include_glossary: boolean;
    };
  };
  template_id?: string;
}

export interface StoryResponse {
  title: string;
  content: string;
  sections?: {
    story: string;
    moral?: string;
    quiz?: any[];
    glossary?: any[];
  };
  metadata?: {
    word_count: number;
    language_ratio: { vi: number; en: number };
    generation_time: number;
    readability_score: number;
  };
  error?: string;
}

// TTS types
export interface TTSRequest {
  text: string;
  output_format?: "wav" | "base64" | "bytes" | "file";
}

export interface TTSResponse {
  audio_base64?: string;
  audio_data?: number[];
  format: string;
  sampling_rate: number;
  duration: number;
  size_bytes?: number;
  file_path?: string;
  file_url?: string;
  error?: string;
}

export interface StoryWithTTSRequest extends AdvancedStoryRequest {
  generate_audio?: boolean;
  audio_format?: "wav" | "base64" | "bytes" | "file";
}

export interface StoryWithTTSResponse extends StoryResponse {
  audio?: TTSResponse;
}

// Chat types
export interface ChatMessage {
  content: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

// API client class
class AIApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      console.log(`🚀 Making request to: ${this.baseUrl}${endpoint}`);
      console.log(`📤 Request data:`, data);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        let errorMessage = `API error: ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.log(`❌ Error response:`, errorData);

          if (typeof errorData === "object" && errorData !== null) {
            errorMessage =
              errorData.detail ||
              errorData.error ||
              errorData.message ||
              errorMessage;
          }
        } catch (parseError) {
          console.log(`⚠️ Could not parse error response:`, parseError);
          const textError = await response.text();
          console.log(`📄 Raw error response:`, textError);
          errorMessage = textError || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`✅ Success response:`, result);
      return result;
    } catch (error) {
      console.error(`💥 Request failed:`, error);

      if (error instanceof Error) {
        throw error;
      }

      // Handle network errors or other non-Error objects
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  // Story generation methods
  async generateStory(request: StoryRequest): Promise<StoryResponse> {
    return this.makeRequest<StoryResponse>("/generate-story", request);
  }

  async generateAdvancedStory(
    request: AdvancedStoryRequest
  ): Promise<StoryResponse> {
    return this.makeRequest<StoryResponse>("/generate-advanced-story", request);
  }

  // Chat method
  async chat(message: ChatMessage): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>("/chat", message);
  }

  // TTS methods
  async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    return this.makeRequest<TTSResponse>("/tts/generate", request);
  }

  async generateTTSFile(request: TTSRequest): Promise<any> {
    return this.makeRequest<unknown>("/tts/generate-file", request);
  }

  async generateStoryWithTTS(
    request: StoryWithTTSRequest
  ): Promise<StoryWithTTSResponse> {
    return this.makeRequest<StoryWithTTSResponse>(
      "/generate-story-with-tts",
      request
    );
  }

  async getTTSStatus(): Promise<{
    available: boolean;
    model: string;
    supported_formats: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/tts/status`);
    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(
      `${this.baseUrl.replace("/api/v1", "")}/health`
    );
    return response.json();
  }
}

// Export singleton instance
export const aiApiClient = new AIApiClient();

// Convenience functions for backward compatibility
export async function generateStory(prompt: string): Promise<string> {
  try {
    const response = await aiApiClient.generateStory({ prompt });

    if (!response || !response.content) {
      console.error("Invalid response from API:", response);
      throw new Error("API returned empty content");
    }

    return response.content;
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

export async function generateAdvancedStory(
  request: AdvancedStoryRequest
): Promise<StoryResponse> {
  try {
    console.log("🎯 generateAdvancedStory called with:", request);
    const result = await aiApiClient.generateAdvancedStory(request);
    console.log("✅ generateAdvancedStory result:", result);
    return result;
  } catch (error) {
    console.error("💥 generateAdvancedStory error:", error);
    throw error;
  }
}

export async function chatWithAI(
  content: string,
  context?: string
): Promise<string> {
  try {
    const response = await aiApiClient.chat({ content, context });
    return response.response;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
}

// TTS convenience functions
export async function generateTTS(
  text: string,
  format: "wav" | "base64" | "bytes" | "file" = "base64"
): Promise<TTSResponse> {
  try {
    const response = await aiApiClient.generateTTS({
      text,
      output_format: format,
    });
    return response;
  } catch (error) {
    console.error("Error generating TTS:", error);
    throw error;
  }
}

export async function generateTTSFile(text: string): Promise<unknown> {
  try {
    const response = await aiApiClient.generateTTSFile({
      text,
      output_format: "file",
    });
    return response;
  } catch (error) {
    console.error("Error generating TTS file:", error);
    throw error;
  }
}

export async function generateStoryWithTTS(
  request: StoryWithTTSRequest
): Promise<StoryWithTTSResponse> {
  try {
    console.log("🎯 generateStoryWithTTS called with:", request);
    const result = await aiApiClient.generateStoryWithTTS(request);
    console.log("✅ generateStoryWithTTS result:", result);
    return result;
  } catch (error) {
    console.error("💥 generateStoryWithTTS error:", error);
    throw error;
  }
}
