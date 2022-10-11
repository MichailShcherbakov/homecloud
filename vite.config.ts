import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import * as path from "path";

export default defineConfig(({}) => {
  return {
    plugins: [
      electron({
        entry: "src/index.ts",
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
