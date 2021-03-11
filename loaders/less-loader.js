const less = require("less");

module.exports = async function (source) {
  const loaderContext = this;
  const cb = this.async();

  let result;
  try {
    result = await less.render(source, {
        plugins: [], // 真正的less-loader 会放入 WebpackFileManager...
        // todo !!! We need to set the filename because otherwise our WebpackFileManager will receive an undefined path for the entry
        filename: loaderContext.resourcePath, // '/Users/fanlong/mine/mini-webpack/demo/style/index.less'
    });
  } catch (e) {
    cb(new Error("less error"));
    return;
  }

  const { css, imports } = result;

  // 给到webpack的是css代码，webpack只认识js代码，会报错...
  // 
  cb(null, css /* 这里是sourcemap */);
};
