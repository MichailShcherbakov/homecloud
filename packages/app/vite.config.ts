import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import { VitePluginNode } from "vite-plugin-node";
import * as path from "path";

export default defineConfig(() => {
  return {
    plugins: [
      electron({
        entry: "src/index.ts",
        vite: {
          plugins: [
            ...VitePluginNode({
              adapter: "nest",
              appPath: "src/index.ts",
              exportName: "viteNodeApp",
              tsCompiler: "swc",
            }),
          ],
        },
      }),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "homecloud",
      },
    },
  };
});
