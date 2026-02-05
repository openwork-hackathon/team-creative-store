import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isTest = Boolean(process.env.VITEST);

export default defineConfig({
  plugins: [
    ...(isTest ? [] : [tanstackRouter({ target: "react", autoCodeSplitting: true })]),
    react(),
    tsconfigPaths()
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true
  }
});
