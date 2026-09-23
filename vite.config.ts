/// <reference types="vitest/config" />
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const NO_CACHE =
  "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

/** Dev/preview: prevent Chrome from keeping stale JS/CSS. */
function noCachePlugin(): Plugin {
  return {
    name: "desklist-no-cache",
    transformIndexHtml(html) {
      if (html.includes('http-equiv="Cache-Control"')) return html;
      return html.replace(
        /<head>/i,
        `<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />`,
      );
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader("Cache-Control", NO_CACHE);
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");

        const raw = req.url?.split("?")[0] ?? "";
        if (raw.startsWith("/mockups/") && raw.endsWith(".html")) {
          const filePath = path.join(server.config.root, raw.slice(1));
          if (fs.existsSync(filePath)) {
            let html = fs.readFileSync(filePath, "utf-8");
            const bust = String(Date.now());
            html = html.replace(
              /(href|src)="([^"?]+\.(?:css|js))(?:\?[^"]*)?"/g,
              (_m, attr: string, asset: string) =>
                `${attr}="${asset}?v=${bust}"`,
            );
            if (!html.includes('http-equiv="Cache-Control"')) {
              html = html.replace(
                /<head>/i,
                `<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />`,
              );
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
            return;
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Cache-Control", NO_CACHE);
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), noCachePlugin()],
  server: {
    port: 5174,
    strictPort: true,
    headers: {
      "Cache-Control": NO_CACHE,
      Pragma: "no-cache",
      Expires: "0",
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
    headers: {
      "Cache-Control": NO_CACHE,
      Pragma: "no-cache",
      Expires: "0",
    },
  },
  test: {
    environment: "node",
  },
});
