#!/usr/bin/env node

/**
 * Script test Together AI API
 * Sử dụng: node scripts/test-together-api.js
 */

require("dotenv").config();

async function testTogetherAPI() {
  console.log("🧪 Testing Together AI API...\n");

  // Check environment variables
  console.log("🔍 Checking environment variables:");
  console.log(
    "TOGETHER_API_URL:",
    process.env.TOGETHER_API_URL ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "TOGETHER_API_KEY:",
    process.env.TOGETHER_API_KEY
      ? `✅ Set (${process.env.TOGETHER_API_KEY.substring(0, 10)}...)`
      : "❌ Missing"
  );

  if (!process.env.TOGETHER_API_URL || !process.env.TOGETHER_API_KEY) {
    console.log("\n❌ Missing required environment variables");
    process.exit(1);
  }

  // Test different models
  const modelsToTest = [
    "meta-llama/Llama-3.2-3B-Instruct-Turbo",
    "meta-llama/Llama-3.2-1B-Instruct-Turbo",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
    "Qwen/Qwen2.5-Coder-32B-Instruct",
  ];

  const testPrompt =
    "Write a short story about a cat and a dog becoming friends.";

  for (const model of modelsToTest) {
    console.log(`\n🤖 Testing model: ${model}`);

    try {
      const requestBody = {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that writes short stories.",
          },
          {
            role: "user",
            content: testPrompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      };

      console.log("📤 Sending request...");

      const response = await fetch(process.env.TOGETHER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📥 Response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          console.log("✅ Success!");
          console.log(
            "📖 Generated content preview:",
            content.substring(0, 100) + "..."
          );
          console.log("📊 Usage:", data.usage || "No usage info");
          break; // Stop testing other models if one works
        } else {
          console.log("❌ No content in response");
          console.log("📄 Full response:", JSON.stringify(data, null, 2));
        }
      } else {
        const errorText = await response.text();
        console.log("❌ Error response:", errorText);

        // Try to parse error details
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            console.log("🔍 Error details:", errorJson.error);
          }
        } catch (e) {
          // Error text is not JSON
        }
      }
    } catch (error) {
      console.log("❌ Request failed:", error.message);
    }
  }

  console.log("\n🏁 API test completed");
}

// Test API endpoint availability
async function testAPIEndpoint() {
  console.log("\n🌐 Testing API endpoint availability...");

  try {
    const response = await fetch(
      process.env.TOGETHER_API_URL.replace("/chat/completions", "/models"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      }
    );

    console.log(
      `📡 Models endpoint: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      const models = await response.json();
      console.log(`✅ Found ${models.data?.length || 0} available models`);

      // Show first few models
      if (models.data && models.data.length > 0) {
        console.log("🤖 Available models (first 5):");
        models.data.slice(0, 5).forEach((model) => {
          console.log(`   - ${model.id}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log("❌ Models endpoint error:", errorText);
    }
  } catch (error) {
    console.log("❌ Failed to check models endpoint:", error.message);
  }
}

// Run tests
async function main() {
  await testAPIEndpoint();
  await testTogetherAPI();
}

main().catch(console.error);
