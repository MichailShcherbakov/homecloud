const path = require("path");
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
  test: /\.svg$/,
  use: ["@svgr/webpack"],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    alias: {
      "@/public/": path.resolve(__dirname, "public"),
      "@/": path.resolve(__dirname, "src"),
    },
    extensions: ["*", ".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
