export async function generateStory(prompt: string) {
  const AZURE_ENDPOINT =
    "https://aiportalapi.stu-platform.live/jpe/openai/deployments/GPT-4o/chat/completions?api-version=2023-05-15"; // Thêm đường dẫn truy cập deployment
  const AZURE_API_KEY = "sk-uX_Ax09Iv6XY-28-M_uYVg";

  const response = await fetch(AZURE_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": AZURE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1024, // Hoặc tuỳ chỉnh theo nhu cầu
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  // Tuỳ thuộc vào cấu trúc trả về, thông thường là: data.choices[0].message.content
  return data.choices?.[0]?.message?.content || "No content generated.";
}

// Fallback story generator for development/testing
function generateFallbackStory(prompt: string): string {
  return `# Câu chuyện mẫu

Đây là một câu chuyện được tạo dựa trên yêu cầu: "${prompt}"`;
}
