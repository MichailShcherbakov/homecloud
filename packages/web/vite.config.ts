import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svg from "vite-svg-loader";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/homecloud/" : "/",
  plugins: [vue(), vuetify({ autoImport: true }), svg()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/uikit/styles/main.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
