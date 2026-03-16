// === TRIANGULATION RECORD ===
// Task: Configure Vitest for Next.js 16 unit testing
// Approach: Official Next.js + Vitest setup with jsdom, React Testing Library
//
// Vertex 1 (Academic):
//   Source: Martin, R.C. (2008). "Clean Code", Ch.9 - Unit Tests. Prentice Hall.
//   Finding: Tests must be fast, independent, repeatable, self-validating, timely (F.I.R.S.T.)
//   Relevance: Vitest + jsdom provides fast, isolated component testing
//
// Vertex 2 (Industry):
//   Source: https://nextjs.org/docs/app/guides/testing/vitest (Next.js 16.1.6 official)
//   Pattern: defineConfig with @vitejs/plugin-react, jsdom environment, vite-tsconfig-paths
//   Adaptation: Added coverage config with thresholds for thesis requirements
//
// Vertex 3 (Internal):
//   Files checked: frontend/tsconfig.json, frontend/package.json
//   Consistency: Confirmed — TypeScript 5, React 19, path aliases via tsconfig
//
// Verdict: PROCEED
// =============================

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    exclude: ["__tests__/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/layout.tsx",
        "src/app/globals.css",
      ],
      thresholds: {
        // Thesis requirement: 80% coverage on new code
        // Start at 50% and increase as pages are migrated
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
