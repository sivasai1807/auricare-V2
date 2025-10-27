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
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ supports @/ imports
    },
  },

  // 🧩 Vitest configuration
  test: {
    environment: "happy-dom", // ✅ fixes jsdom/parse5 ESM error
    globals: true, // optional, enables global `describe`, `it`, etc.
    exclude: ["node_modules", "dist", "e2e"], // ✅ skip Playwright tests
    setupFiles: "./src/setupTests.ts", // optional (if you want setup)
  },
}));
