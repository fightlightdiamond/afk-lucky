#!/usr/bin/env tsx

/**
 * Project Structure Validation Script
 *
 * This script validates that the project follows the established
 * code structure standards and naming conventions.
 */

import { readdir, stat } from "fs/promises";
import { join } from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class StructureValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  async validateProject(): Promise<ValidationResult> {
    console.log("🔍 Validating project structure...\n");

    await this.validateFolderStructure();
    await this.validateNamingConventions();
    await this.validateBarrelExports();
    await this.validateTestStructure();

    const valid = this.errors.length === 0;

    console.log(
      `\n${valid ? "✅" : "❌"} Validation ${valid ? "passed" : "failed"}`
    );
    console.log(
      `Errors: ${this.errors.length}, Warnings: ${this.warnings.length}\n`
    );

    if (this.errors.length > 0) {
      console.log("❌ Errors:");
      this.errors.forEach((error) => console.log(`  - ${error}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
      console.log();
    }

    return {
      valid,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private async validateFolderStructure(): Promise<void> {
    console.log("📁 Validating folder structure...");

    const requiredFolders = [
      "src/components",
      "src/components/admin",
      "src/components/auth",
      "src/components/navigation",
      "src/components/providers",
      "src/components/story",
      "src/components/ui",
      "src/__tests__",
      "src/__tests__/__mocks__",
      "src/__tests__/components",
      "src/__tests__/api",
      "src/__tests__/hooks",
      "src/hooks",
      "src/lib",
      "src/types",
      "src/stories",
      "docs",
    ];

    for (const folder of requiredFolders) {
      try {
        const stats = await stat(folder);
        if (!stats.isDirectory()) {
          this.errors.push(`${folder} exists but is not a directory`);
        }
      } catch {
        this.errors.push(`Required folder missing: ${folder}`);
      }
    }
  }

  private async validateNamingConventions(): Promise<void> {
    console.log("📝 Validating naming conventions...");

    await this.validateComponentNaming("src/components");
    await this.validateHookNaming("src/hooks");
    await this.validateTestNaming("src/__tests__");
  }

  private async validateComponentNaming(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Validate directory naming (should be lowercase or kebab-case)
          if (!/^[a-z][a-z0-9-]*$/.test(entry.name)) {
            this.warnings.push(
              `Directory name should be lowercase/kebab-case: ${fullPath}`
            );
          }

          await this.validateComponentNaming(fullPath);
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          // Skip index files and non-component files
          if (entry.name === "index.ts" || entry.name === "types.ts") {
            continue;
          }

          // Component files should be PascalCase
          const baseName = entry.name.replace(
            /\.(tsx?|stories\.tsx?|test\.tsx?)$/,
            ""
          );
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(baseName)) {
            this.warnings.push(
              `Component file should be PascalCase: ${fullPath}`
            );
          }
        }
      }
    } catch (error) {
      this.warnings.push(`Could not validate naming in ${dir}: ${error}`);
    }
  }

  private async validateHookNaming(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
          const baseName = entry.replace(/\.(tsx?)$/, "");

          // Hook files should start with "use" and be camelCase
          if (
            !baseName.startsWith("use") ||
            !/^use[A-Z][a-zA-Z0-9]*$/.test(baseName)
          ) {
            this.warnings.push(
              `Hook file should start with "use" and be camelCase: ${join(
                dir,
                entry
              )}`
            );
          }
        }
      }
    } catch (error) {
      this.warnings.push(`Could not validate hook naming in ${dir}: ${error}`);
    }
  }

  private async validateTestNaming(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.validateTestNaming(fullPath);
        } else if (
          entry.name.endsWith(".test.tsx") ||
          entry.name.endsWith(".test.ts")
        ) {
          // Test files should match their component names
          const baseName = entry.name.replace(/\.test\.(tsx?)$/, "");

          // Check if corresponding component exists
          const componentPath = fullPath
            .replace("/__tests__/", "/")
            .replace(".test.", ".");
          try {
            await stat(componentPath);
          } catch {
            this.warnings.push(
              `Test file exists but no corresponding component found: ${fullPath}`
            );
          }
        }
      }
    } catch (error) {
      this.warnings.push(`Could not validate test naming in ${dir}: ${error}`);
    }
  }

  private async validateBarrelExports(): Promise<void> {
    console.log("📦 Validating barrel exports...");

    const expectedBarrels = [
      "src/components/index.ts",
      "src/components/admin/index.ts",
      "src/components/auth/index.ts",
      "src/components/navigation/index.ts",
      "src/components/providers/index.ts",
      "src/components/story/index.ts",
    ];

    for (const barrel of expectedBarrels) {
      try {
        await stat(barrel);
      } catch {
        this.warnings.push(`Missing barrel export file: ${barrel}`);
      }
    }
  }

  private async validateTestStructure(): Promise<void> {
    console.log("🧪 Validating test structure...");

    const requiredTestDirs = [
      "src/__tests__/__mocks__",
      "src/__tests__/components",
      "src/__tests__/api",
      "src/__tests__/hooks",
      "src/__tests__/test-utils",
    ];

    for (const testDir of requiredTestDirs) {
      try {
        const stats = await stat(testDir);
        if (!stats.isDirectory()) {
          this.errors.push(`${testDir} exists but is not a directory`);
        }
      } catch {
        this.warnings.push(`Recommended test directory missing: ${testDir}`);
      }
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new StructureValidator();
  validator
    .validateProject()
    .then((result) => {
      process.exit(result.valid ? 0 : 1);
    })
    .catch((error) => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export { StructureValidator };
