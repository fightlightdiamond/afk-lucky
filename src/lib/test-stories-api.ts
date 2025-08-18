// Test script để kiểm tra Stories API
// Chạy trong browser console hoặc sử dụng trong component

export async function testStoriesAPI() {
  console.log("🧪 Testing Stories API...");

  try {
    // Test GET /api/stories
    console.log("1️⃣ Testing GET /api/stories");
    const getResponse = await fetch("/api/stories");
    console.log("📡 GET Response status:", getResponse.status);
    console.log(
      "📡 GET Response headers:",
      Object.fromEntries(getResponse.headers.entries())
    );

    if (!getResponse.ok) {
      throw new Error(
        `GET failed: ${getResponse.status} ${getResponse.statusText}`
      );
    }

    const stories = await getResponse.json();
    console.log("📦 GET Response data:", stories);
    console.log(
      "📦 Stories count:",
      Array.isArray(stories) ? stories.length : "Not an array"
    );

    // Test POST /api/story
    console.log("\n2️⃣ Testing POST /api/story");
    const testPrompt = `Test story created at ${new Date().toISOString()}`;

    const postResponse = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: testPrompt }),
    });

    console.log("📡 POST Response status:", postResponse.status);
    console.log(
      "📡 POST Response headers:",
      Object.fromEntries(postResponse.headers.entries())
    );

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(
        `POST failed: ${postResponse.status} ${postResponse.statusText} - ${errorText}`
      );
    }

    const newStory = await postResponse.json();
    console.log("📦 POST Response data:", newStory);

    // Test GET again to see if new story appears
    console.log("\n3️⃣ Testing GET /api/stories again");
    const getResponse2 = await fetch("/api/stories");
    const stories2 = await getResponse2.json();
    console.log(
      "📦 Updated stories count:",
      Array.isArray(stories2) ? stories2.length : "Not an array"
    );
    console.log(
      "📦 Latest story:",
      Array.isArray(stories2) && stories2.length > 0
        ? stories2[0]
        : "No stories"
    );

    return {
      success: true,
      initialCount: Array.isArray(stories) ? stories.length : 0,
      finalCount: Array.isArray(stories2) ? stories2.length : 0,
      newStory,
    };
  } catch (error) {
    console.error("❌ API Test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function để chạy test từ browser console
if (typeof window !== "undefined") {
  (window as any).testStoriesAPI = testStoriesAPI;
  console.log("💡 Run testStoriesAPI() in console to test the API");
}
