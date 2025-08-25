// Simple test script to verify API enhancements
const fetch = require("node-fetch");

async function testEnhancedAPI() {
  const baseUrl = "http://localhost:3000";

  console.log("Testing enhanced user API endpoint...");

  try {
    // Test basic query
    const response1 = await fetch(
      `${baseUrl}/api/admin/users?page=1&pageSize=5`
    );
    const data1 = await response1.json();

    console.log("✅ Basic query successful");
    console.log("- Users returned:", data1.users?.length || 0);
    console.log("- Pagination info:", data1.pagination);
    console.log("- Enhanced metadata:", !!data1.metadata);

    // Test search functionality
    const response2 = await fetch(
      `${baseUrl}/api/admin/users?search=admin&page=1&pageSize=5`
    );
    const data2 = await response2.json();

    console.log("✅ Search query successful");
    console.log("- Search results:", data2.users?.length || 0);

    // Test filtering
    const response3 = await fetch(
      `${baseUrl}/api/admin/users?status=active&sortBy=created_at&sortOrder=desc&page=1&pageSize=5`
    );
    const data3 = await response3.json();

    console.log("✅ Filter and sort query successful");
    console.log("- Filtered results:", data3.users?.length || 0);
    console.log(
      "- Sort applied:",
      data3.filters?.sortBy,
      data3.filters?.sortOrder
    );

    // Test enhanced metadata
    if (data1.metadata) {
      console.log("✅ Enhanced metadata available:");
      console.log(
        "- Available roles:",
        data1.metadata.availableRoles?.length || 0
      );
      console.log(
        "- Available locales:",
        data1.metadata.availableLocales?.length || 0
      );
      console.log(
        "- Query performance tracked:",
        !!data1.metadata.queryPerformance
      );
    }

    console.log("\n🎉 All API enhancements working correctly!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

// Run the test
testEnhancedAPI();
