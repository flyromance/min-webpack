const path = require("path");
const webpack = require("webpack");

const jsLoader = require.resolve("./loaders/js-loader");
const lessLoader = require.resolve("./loaders/less-loader");
const cssLoader = require.resolve("./loaders/css-loader");

const MyPlugin = require("./plugins/my-plugins");

webpack(
  {
    mode: "development",
    devtool: "none",
    entry: "./demo/webpack_index.js",
    output: {
      path: path.resolve("dist"),
      filename: "[name].js", // name 默认是 main
      chunkFilename: "[name].chunk.js",
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: jsLoader, // 不能写成 require("./loaders/loader1")
              options: {
                aa: "123",
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: cssLoader,
            },
            {
              loader: lessLoader,
              options: {
                lessOptions: {
                  
                },
              }
            },
          ],
        },
      ],
    },
    plugins: [new MyPlugin()],
  },
  (err, result) => {
    console.log("build complete");
  }
);
