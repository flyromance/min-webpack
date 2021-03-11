const path = require("path");
const { execSync } = require("child_process");

const webpack = require("./lib");

webpack(
  {
    entry: "./demo/index.js",
    output: {
      path: path.resolve("dist"),
      filename: "bundle_mini.js",
      publicPath: '/',
    },
  },
  (err, result) => {
    console.log("build complete");
  }
);
