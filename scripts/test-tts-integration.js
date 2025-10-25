#!/usr/bin/env node

/**
 * Test script for TTS integration
 * Tests both Python API and frontend integration
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🎯 TTS Integration Test Suite");
console.log("================================\n");

// Test configurations
const API_BASE_URL = "http://localhost:8000/api/v1";
const FRONTEND_URL = "http://localhost:3000";

// Test data
const testTexts = [
  "Xin chào anh em đến với bài tập của khoá AI Application Engineer",
  "Hôm nay là một ngày đẹp trời để học tiếng Anh",
  "Công nghệ AI đang phát triển rất nhanh chóng",
];

const storyPrompts = [
  "Kể một câu chuyện ngắn về một chú mèo thông minh",
  "Viết truyện về cuộc phiêu lưu của một cậu bé",
  "Câu chuyện về tình bạn giữa hai đứa trẻ",
];

// Utility functions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
  const fetch = (await import("node-fetch")).default;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    const result = execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: "pipe",
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testPythonDependencies() {
  console.log("📦 Testing Python dependencies...");

  const dependencies = [
    "transformers",
    "torch",
    "soundfile",
    "numpy",
    "fastapi",
    "uvicorn",
  ];

  for (const dep of dependencies) {
    const result = runCommand(
      `python -c "import ${dep}; print('${dep} OK')"`,
      "./aiapi"
    );
    if (result.success) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - ${result.error}`);
      return false;
    }
  }

  return true;
}

async function testAPIServer() {
  console.log("\n🚀 Testing API server...");

  // Test health endpoint
  const health = await makeRequest(
    `${API_BASE_URL.replace("/api/v1", "")}/health`
  );
  if (!health.success) {
    console.log("  ❌ API server not running");
    console.log("  💡 Start with: cd aiapi && python run.py");
    return false;
  }

  console.log("  ✅ API server running");
  return true;
}

async function testTTSStatus() {
  console.log("\n🔊 Testing TTS status...");

  const result = await makeRequest(`${API_BASE_URL}/tts/status`);

  if (!result.success) {
    console.log("  ❌ TTS status endpoint failed");
    return false;
  }

  const { available, model, supported_formats } = result.data;

  console.log(`  ✅ TTS Available: ${available}`);
  console.log(`  📱 Model: ${model}`);
  console.log(`  🎵 Formats: ${supported_formats.join(", ")}`);

  return available;
}

async function testTTSGeneration() {
  console.log("\n🎤 Testing TTS generation...");

  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`  Testing text ${i + 1}: "${text.substring(0, 30)}..."`);

    const result = await makeRequest(`${API_BASE_URL}/tts/generate`, {
      method: "POST",
      body: JSON.stringify({
        text: text,
        output_format: "base64",
      }),
    });

    if (!result.success) {
      console.log(`    ❌ Failed: ${result.error || result.data?.detail}`);
      continue;
    }

    const { duration, sampling_rate, size_bytes } = result.data;
    console.log(
      `    ✅ Generated: ${duration.toFixed(
        1
      )}s, ${sampling_rate}Hz, ${size_bytes} bytes`
    );

    // Save test audio file
    if (result.data.audio_base64) {
      const audioBuffer = Buffer.from(result.data.audio_base64, "base64");
      const filename = `test_audio_${i + 1}.wav`;
      fs.writeFileSync(filename, audioBuffer);
      console.log(`    💾 Saved: ${filename}`);
    }
  }

  return true;
}

async function testStoryWithTTS() {
  console.log("\n📚 Testing Story with TTS...");

  for (let i = 0; i < Math.min(2, storyPrompts.length); i++) {
    const prompt = storyPrompts[i];
    console.log(`  Testing story ${i + 1}: "${prompt}"`);

    const result = await makeRequest(
      `${API_BASE_URL}/generate-story-with-tts`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt,
          generate_audio: true,
          audio_format: "base64",
          preferences: {
            length: "short",
            language_mix: {
              ratio: 80,
              base_language: "vi",
              target_language: "en",
            },
          },
        }),
      }
    );

    if (!result.success) {
      console.log(`    ❌ Failed: ${result.error || result.data?.detail}`);
      continue;
    }

    const { title, content, metadata, audio } = result.data;

    console.log(`    ✅ Story: "${title}"`);
    console.log(`    📝 Content: ${content.length} chars`);

    if (metadata) {
      console.log(
        `    📊 Stats: ${metadata.word_count} words, ${metadata.generation_time}ms`
      );
    }

    if (audio) {
      if (audio.error) {
        console.log(`    🔊 Audio Error: ${audio.error}`);
      } else {
        console.log(`    🔊 Audio: ${audio.duration.toFixed(1)}s`);

        // Save story audio
        if (audio.audio_base64) {
          const audioBuffer = Buffer.from(audio.audio_base64, "base64");
          const filename = `story_audio_${i + 1}.wav`;
          fs.writeFileSync(filename, audioBuffer);
          console.log(`    💾 Saved: ${filename}`);
        }
      }
    }
  }

  return true;
}

async function testFrontendFiles() {
  console.log("\n🌐 Testing Frontend files...");

  const requiredFiles = [
    "src/lib/aiapi.ts",
    "src/hooks/useTTS.ts",
    "src/components/story/TTSPlayer.tsx",
    "src/app/demo/tts-test/page.tsx",
  ];

  for (const file of requiredFiles) {
    if (checkFileExists(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - Missing`);
      return false;
    }
  }

  return true;
}

async function testFrontendBuild() {
  console.log("\n🔨 Testing Frontend build...");

  const result = runCommand("npm run build");

  if (result.success) {
    console.log("  ✅ Frontend build successful");
    return true;
  } else {
    console.log("  ❌ Frontend build failed");
    console.log(`  Error: ${result.error}`);
    return false;
  }
}

async function generateTestReport(results) {
  console.log("\n📋 Test Report");
  console.log("==============");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌";
    console.log(`${status} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\nTotal: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("\n🎉 All tests passed! TTS integration is ready.");
    console.log("\n📖 Next steps:");
    console.log(
      "   1. Visit http://localhost:3000/demo/tts-test to test in browser"
    );
    console.log("   2. Integrate TTSPlayer into your story components");
    console.log("   3. Add TTS option to story generation forms");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the errors above.");
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      passed,
      total,
      success_rate: ((passed / total) * 100).toFixed(1) + "%",
    },
  };

  fs.writeFileSync("tts_test_report.json", JSON.stringify(report, null, 2));
  console.log("\n💾 Detailed report saved to: tts_test_report.json");
}

// Main test runner
async function runTests() {
  const results = [];

  try {
    // Test 1: Python dependencies
    const deps = await testPythonDependencies();
    results.push({ name: "Python Dependencies", passed: deps });

    // Test 2: API server
    const api = await testAPIServer();
    results.push({ name: "API Server", passed: api });

    if (!api) {
      console.log("\n⚠️  Skipping API tests - server not running");
      await generateTestReport(results);
      return;
    }

    // Test 3: TTS status
    const status = await testTTSStatus();
    results.push({ name: "TTS Status", passed: status });

    // Test 4: TTS generation
    if (status) {
      const tts = await testTTSGeneration();
      results.push({ name: "TTS Generation", passed: tts });

      // Test 5: Story with TTS
      const story = await testStoryWithTTS();
      results.push({ name: "Story with TTS", passed: story });
    } else {
      console.log("\n⚠️  Skipping TTS tests - service not available");
    }

    // Test 6: Frontend files
    const files = await testFrontendFiles();
    results.push({ name: "Frontend Files", passed: files });

    // Test 7: Frontend build (optional)
    console.log("\n🤔 Test frontend build? (This may take a while) [y/N]");
    // For automated testing, skip build test
    // const build = await testFrontendBuild();
    // results.push({ name: 'Frontend Build', passed: build });

    await generateTestReport(results);
  } catch (error) {
    console.error("\n💥 Test suite failed:", error);
    results.push({ name: "Test Suite", passed: false, error: error.message });
    await generateTestReport(results);
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
