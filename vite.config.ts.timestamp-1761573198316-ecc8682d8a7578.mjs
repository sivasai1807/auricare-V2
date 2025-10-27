// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
      // ✅ supports @/ imports
    }
  },
  // 🧩 Vitest configuration
  test: {
    environment: "happy-dom",
    // ✅ fixes jsdom/parse5 ESM error
    globals: true,
    // optional, enables global `describe`, `it`, etc.
    exclude: ["node_modules", "dist", "e2e"],
    // ✅ skip Playwright tests
    setupFiles: "./src/setupTests.ts"
    // optional (if you want setup)
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHtjb21wb25lbnRUYWdnZXJ9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHttb2RlfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihcbiAgICBCb29sZWFuXG4gICksXG5cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSwgLy8gXHUyNzA1IHN1cHBvcnRzIEAvIGltcG9ydHNcbiAgICB9LFxuICB9LFxuXG4gIC8vIFx1RDgzRVx1RERFOSBWaXRlc3QgY29uZmlndXJhdGlvblxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6IFwiaGFwcHktZG9tXCIsIC8vIFx1MjcwNSBmaXhlcyBqc2RvbS9wYXJzZTUgRVNNIGVycm9yXG4gICAgZ2xvYmFsczogdHJ1ZSwgLy8gb3B0aW9uYWwsIGVuYWJsZXMgZ2xvYmFsIGBkZXNjcmliZWAsIGBpdGAsIGV0Yy5cbiAgICBleGNsdWRlOiBbXCJub2RlX21vZHVsZXNcIiwgXCJkaXN0XCIsIFwiZTJlXCJdLCAvLyBcdTI3MDUgc2tpcCBQbGF5d3JpZ2h0IHRlc3RzXG4gICAgc2V0dXBGaWxlczogXCIuL3NyYy9zZXR1cFRlc3RzLnRzXCIsIC8vIG9wdGlvbmFsIChpZiB5b3Ugd2FudCBzZXR1cClcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFRLG9CQUFtQjtBQUMzQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVEsdUJBQXNCO0FBSjlCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUMsS0FBSSxPQUFPO0FBQUEsRUFDdkMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRTtBQUFBLElBQzlEO0FBQUEsRUFDRjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU07QUFBQSxJQUNKLGFBQWE7QUFBQTtBQUFBLElBQ2IsU0FBUztBQUFBO0FBQUEsSUFDVCxTQUFTLENBQUMsZ0JBQWdCLFFBQVEsS0FBSztBQUFBO0FBQUEsSUFDdkMsWUFBWTtBQUFBO0FBQUEsRUFDZDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
