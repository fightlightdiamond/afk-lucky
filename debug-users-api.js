// Debug script to test the users API endpoint
// Node 18+ has global fetch; no import needed

async function testUsersAPI() {
  try {
    console.log("🔍 Testing users API endpoint...");

    // Test the API endpoint directly
    const response = await fetch("http://localhost:3000/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Response status:", response.status);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log("❌ Error response:", errorData);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

testUsersAPI();
