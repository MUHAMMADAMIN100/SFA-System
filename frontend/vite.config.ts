import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        // Позволяет писать `@use "mixins" as *;` и `@use "tokens";` в SCSS.
        loadPaths: [
          fileURLToPath(new URL("./src/shared/styles", import.meta.url)),
          fileURLToPath(new URL("./src/shared/config", import.meta.url)),
        ],
      },
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 5173, host: true },
});
