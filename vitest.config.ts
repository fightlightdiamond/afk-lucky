import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      // Unit and integration tests
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./src/__tests__/setup.ts"],
          globals: true,
          include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
          coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
              "node_modules/",
              "src/__tests__/setup.ts",
              "**/*.d.ts",
              "**/*.config.*",
              "**/coverage/**",
              "**/dist/**",
              "**/.next/**",
              "**/stories/**",
            ],
            thresholds: {
              global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
              },
            },
          },
        },
      },
      // Storybook tests
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
