import { defineConfig } from "vitest/config";
import { join } from "path";
import { VitePluginNode } from "vite-plugin-node";

const alias = {
  "@": join(__dirname, "src"),
  "@public": join(__dirname, "public"),
  "@electron": join(__dirname, "electron"),
  "@client": join(__dirname, "src/client"),
  "@server": join(__dirname, "src/server"),
  "@common": join(__dirname, "src/common"),
};

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    globals: true,
    environment: "node",
  },
  // @ts-ignore
  plugins: [
    ...VitePluginNode({
      adapter: "nest",
      appPath: "electron/main/index.ts",
      exportName: "viteNodeApp",
      tsCompiler: "swc",
    }),
  ],
  clearScreen: false,
});
