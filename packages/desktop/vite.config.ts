import { rmSync } from "fs";
import { join } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import { VitePluginNode } from "vite-plugin-node";

rmSync(join(__dirname, "build"), { recursive: true, force: true });

const alias = {
  "@": join(__dirname, "src"),
  "@public": join(__dirname, "public"),
  "@electron": join(__dirname, "electron"),
  "@client": join(__dirname, "src/client"),
  "@server": join(__dirname, "src/server"),
  "@common": join(__dirname, "src/common"),
};

export default defineConfig({
  root: join(__dirname, "src", "client"),
  resolve: {
    alias,
  },
  build: {
    outDir: join(__dirname, "build", "renderer"),
    emptyOutDir: true,
  },
  plugins: [
    svgr(),
    react(),
    electron({
      entry: "electron/main/index.ts",
      vite: {
        build: {
          outDir: "build/main",
        },
        plugins: [
          ...VitePluginNode({
            adapter: "nest",
            appPath: "electron/main/index.ts",
            exportName: "viteNodeApp",
            tsCompiler: "swc",
          }),
        ],
        resolve: {
          alias,
        },
      },
    }),
    renderer({
      nodeIntegration: true,
    }),
  ],
  clearScreen: false,
});
