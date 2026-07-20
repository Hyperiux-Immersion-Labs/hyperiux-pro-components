import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // server-only throws unconditionally outside Next.js's own build
      // pipeline - it has no meaning to a Node-based test runner, so it's
      // stubbed to a no-op rather than actually installing a fake module.
      "server-only": path.resolve(__dirname, "./test/stubs/server-only.js"),
    },
  },
});
