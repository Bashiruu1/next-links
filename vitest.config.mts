import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    tsconfigPaths(), // resolves @/* → src/* from tsconfig.json
    react(),
  ],
  resolve: {
    alias: {
      // Resolve @/* → src/* (mirrors tsconfig.json paths)
      "@": path.resolve(__dirname, "src"),
      // Swap next/image for a plain <img> so jsdom doesn't choke on
      // Next.js image-optimisation internals.
      "next/image": path.resolve(__dirname, "tests/__mocks__/next-image.tsx"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/components/**", "src/lib/**", "src/config/**"],
      exclude: ["tests/**"],
    },
  },
});
