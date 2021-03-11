const loaderUtils = require('loader-utils');

/**
 * 
需求：
1、正式环境中，去除项目中所有的console.log()
2、最后再打印出一个hello world

// loaderUtils 用法
const currentRequest = loaderUtils.getCurrentRequest(loaderContext);
const remainRequest = loaderUtils.getRemainingRequest(loaderContext);
const query = loaderUtils.parseQuery('?'); // 必须以 ? 开头，不然会报错
const parsedObj = loaderUtils.parseString(''); // 
 */
module.exports = function (source) {

  // 通过这个拿到loader的参数
  const loaderContext = this;
  const { context, target, loaders } = loaderContext;

  // 获取 config.js 中对该loader提供的options
  const options = loaderUtils.getOptions(loaderContext);

  // todo 如何获取此次构建的 mode，注意 webpack 3 没有mode概念。。。 4才有
  // const isProd = process.env.NODE_ENV === "production";
  // if (!isProd) {
  //   return source;
  // }

  // Buffer.isBuffer()
  if (typeof source !== "string") return source;

  const tips = 'console.log("hello world")';

  // source 类型？
  if (typeof source === "string") {
    source = source.replace(/console\.log\(.*?\)/gi, "");
    source = source + "\n" + tips;
  }

  return source;
};

// 申明输出的source类型
// module.exports
