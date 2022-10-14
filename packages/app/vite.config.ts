import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import { VitePluginNode } from "vite-plugin-node";
import { resolve } from "path";

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
          resolve: {
            alias: {
              "~": resolve(__dirname, "./src"),
            },
          },
        },
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "homecloud",
      },
    },
  };
});
