import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./src", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
