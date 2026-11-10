import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages repository name
  base: "/cv_me/",

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,

    proxy: {
      "/graphql": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      "/media": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});