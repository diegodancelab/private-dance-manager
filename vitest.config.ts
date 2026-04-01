import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/__tests__/**/*.test.ts"],
    // Each test file gets its own isolated module registry — critical for
    // vi.mock() to work correctly across test files.
    isolate: true,
  },
});
