import { rmSync } from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import electron from "vite-electron-plugin";
import { customStart, alias } from "vite-electron-plugin/plugin";
import renderer from "vite-plugin-electron-renderer";
import pkg from "./package.json";
import { VitePluginNode } from "vite-plugin-node";

rmSync(path.join(__dirname, "dist-electron"), { recursive: true, force: true });

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "@public": path.join(__dirname, "public"),
      "@electron": path.join(__dirname, "electron"),
      "@client": path.join(__dirname, "src/client"),
      "@server": path.join(__dirname, "src/server"),
    },
  },
  plugins: [
    svgr(),
    react(),
    electron({
      include: ["electron", "preload", "src/server"],
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,
      },
      // // Will start Electron via VSCode Debug
      // plugins: process.env.VSCODE_DEBUG
      //   ? [
      //       customStart(
      //         debounce(() =>
      //           console.log(
      //             /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
      //           )
      //         )
      //       ),
      //     ]
      //   : undefined,
      plugins: [
        alias([
          { find: "@", replacement: path.join(__dirname, "src") },
          { find: "@server", replacement: path.join(__dirname, "src/server") },
          { find: "@client", replacement: path.join(__dirname, "src/client") },
          { find: "@public", replacement: path.join(__dirname, "src/public") },
          {
            find: "@electron",
            replacement: path.join(__dirname, "src/electron"),
          },
        ]),
      ],
    }),
    renderer({
      nodeIntegration: true,
    }),
  ],
  server: process.env.VSCODE_DEBUG
    ? (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })()
    : undefined,
  clearScreen: false,
});

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }) as Fn;
}
