/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

function cspApiBasePlugin(apiBase: string): Plugin {
  return {
    name: "csp-api-base",
    transformIndexHtml(html) {
      if (!apiBase) return html;
      let origin: string;
      try {
        origin = new URL(apiBase).origin;
      } catch {
        return html;
      }
      return html.replace(
        /connect-src\s+'self'/,
        `connect-src 'self' ${origin}`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react(), cspApiBasePlugin(env.VITE_API_BASE || "")],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          shareCardRender: resolve(__dirname, "share-card-render.html"),
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8787",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyRes", (proxyRes) => {
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["x-accel-buffering"] = "no";
            });
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "node",
      setupFiles: ["./src/test/setup.ts"],
      exclude: ["src/__tests__/e2e-llm.test.ts", "node_modules/**"],
    },
  };
});
