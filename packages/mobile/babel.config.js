module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        extensions: [
          ".ios.ts",
          ".android.ts",
          ".ts",
          ".ios.tsx",
          ".android.tsx",
          ".jsx",
          ".js",
          ".json",
          ".svg",
        ],
        alias: {
          "@components": "./src/components",
          "@assets": "./src/assets",
          "@theme": "./src/theme",
          "@": "./src",
        },
      },
    ],
  ],
};
