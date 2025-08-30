#!/usr/bin/env tsx

/**
 * Comprehensive test runner for the admin user management system
 * This script runs all types of tests: unit, integration, accessibility, and E2E
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runTest(name: string, command: string): Promise<TestResult> {
    const testStart = Date.now();
    console.log(`\n🧪 Running ${name}...`);

    try {
      execSync(command, {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      const duration = Date.now() - testStart;
      const result: TestResult = {
        name,
        passed: true,
        duration,
      };

      console.log(`✅ ${name} passed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - testStart;
      const result: TestResult = {
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };

      console.log(`❌ ${name} failed in ${duration}ms`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      return result;
    }
  }

  async runAllTests() {
    console.log(
      "🚀 Starting comprehensive test suite for Admin User Management"
    );
    console.log("=".repeat(60));

    // 1. Unit Tests
    this.results.push(
      await this.runTest("Unit Tests", "npm run test -- --run")
    );

    // 2. Integration Tests
    this.results.push(
      await this.runTest(
        "Integration Tests",
        "npm run test:integration -- --run"
      )
    );

    // 3. Component Tests (Storybook)
    this.results.push(
      await this.runTest(
        "Storybook Component Tests",
        "npm run test:storybook -- --run"
      )
    );

    // 4. Accessibility Tests (if Playwright is available)
    if (this.isPlaywrightAvailable()) {
      this.results.push(
        await this.runTest(
          "Accessibility E2E Tests",
          "npm run test:accessibility"
        )
      );

      // 5. Full E2E Tests
      this.results.push(
        await this.runTest("End-to-End Tests", "npm run test:e2e")
      );
    } else {
      console.log("⚠️  Playwright not available, skipping E2E tests");
      console.log('   Run "npx playwright install" to enable E2E testing');
    }

    this.printSummary();
  }

  private isPlaywrightAvailable(): boolean {
    try {
      execSync("npx playwright --version", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  private printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));

    this.results.forEach((result) => {
      const status = result.passed ? "✅" : "❌";
      const duration = `${result.duration}ms`;
      console.log(
        `${status} ${result.name.padEnd(30)} ${duration.padStart(10)}`
      );

      if (!result.passed && result.error) {
        console.log(`   └─ ${result.error}`);
      }
    });

    console.log("-".repeat(60));
    console.log(
      `Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`
    );
    console.log(`Total Duration: ${totalDuration}ms`);

    if (failed > 0) {
      console.log("\n❌ Some tests failed. Please review the errors above.");
      process.exit(1);
    } else {
      console.log("\n🎉 All tests passed successfully!");
      console.log("\n📋 Test Coverage Summary:");
      console.log(
        "   ✅ Unit Tests - Individual component and function testing"
      );
      console.log("   ✅ Integration Tests - Complete workflow testing");
      console.log("   ✅ Component Tests - Storybook visual component testing");

      if (this.isPlaywrightAvailable()) {
        console.log(
          "   ✅ Accessibility Tests - WCAG compliance and screen reader support"
        );
        console.log("   ✅ E2E Tests - Full user journey testing");
      }

      console.log(
        "\n🛡️  Your admin user management system is thoroughly tested!"
      );
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch((error) => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
}

export { TestRunner };
