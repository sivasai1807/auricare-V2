/// <reference types="vitest" />
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "lovable-tagger";

export default defineConfig(({mode}) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    // Load lovable-tagger only in development
    mode === "development" ? componentTagger() : undefined,
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ Enables @ imports
    },
  },

  test: {
    globals: true, // ✅ allows global test functions like describe/it
    environment: "happy-dom", // ✅ lightweight DOM for React testing
    setupFiles: "./src/setupTests.ts", // optional setup for Vitest
    exclude: ["node_modules", "dist", "e2e"], // ✅ skip Playwright tests
    coverage: {
      reporter: ["text", "json", "html"], // optional: nice coverage reports
    },
  },
}));
