// additionalPass:AsyncSeriesHook {_args: Array(1), taps: Array(0), interceptors: Array(0), call: undefined, promise: ƒ, …}

// todo 所有hook都继承Hook
module.exports = class MyPlugin {
  apply(compiler) {
    const self = this;
    /**
     * SyncHook: [
     *    environment, afterEnvironment, afterPlugins, afterResolvers, normalModuleFactory, contextModuleFactory,
     *    compile, thisCompilation, compilation, watchClose, invalid, failed
     * ]
     *
     * 不管回调返回什么，都继续执行
     *
     * environment = {
     *  taps, // 缓存注册的回调
     *  promise,
     *
     *  call,
     *  callAsync,
     *
     *  tap,
     *  tapAsync, // 调用会报错
     *  tapPromise, // 调用会报错
     * }
     *
     * 回调函数中 this 是 undefined
     */
    compiler.hooks.environment.tap("init", function () {
      console.log("environment 1");
    });
    compiler.hooks.afterEnvironment.tap("init", function () {
      console.log("afterEnvironment 2");
    });
    // sync bail hook
    compiler.hooks.entryOption.tap("init", function (context, entry) {
      // 路径上下文、入口(原始的)
      console.log("entryOption 3", context, entry);
    });
    compiler.hooks.afterPlugins.tap("init", function (compiler) {
      console.log("afterPlugins 4", compiler);
    });
    compiler.hooks.afterResolvers.tap("init", function (compiler) {
      console.log("afterResolvers 5", compiler);
    });
    compiler.hooks.beforeRun.tapAsync("init", function (compiler, done) {
      console.log("beforeRun 6", compiler);
      done();
    });
    compiler.hooks.run.tapAsync("init", function (compiler, done) {
      console.log("run 7", compiler);
      done();
    });
    compiler.hooks.normalModuleFactory.tap("init", function (normalModuleFactory) {
      console.log("normalModuleFactory 8", normalModuleFactory);
    });
    compiler.hooks.contextModuleFactory.tap("init", function (contextModuleFactory) {
        console.log("contextModuleFactory 9", contextModuleFactory);
    });
    compiler.hooks.beforeCompile.tapAsync("init", function (compilation, done) {
      console.log("beforeCompile 10", arguments);
      setTimeout(() => {
        done();
      }, 2000);
    });
    compiler.hooks.compile.tap("init", function (object) {
      const { normalModuleFactory, contextModuleFactory, compilationDependencies = new Set(), } = object;
      console.log("compile 11", object);
    });
    compiler.hooks.thisCompilation.tap("init", function (compilation) {
      console.log("thisCompilation", compilation);
    });
    compiler.hooks.compilation.tap("init", function (compilation) {
      console.log("compilation", compilation);
      compilation.hooks.beforeModuleIds.tap("NamedModuleIdsPlugin", function(modules) {
        const { chunkGraph } = compilation;
        for (const module of modules) {
          if (module.id === null && module.libIdent) {
            const id = module.libIdent({
              context: compiler.options.context
            });

            console.log(id);
            // const hash = createHash(options.hashFunction);
            // hash.update(id);
            // const hashId = /** @type {string} */ (hash.digest(
            //   options.hashDigest
            // ));
            // let len = options.hashDigestLength;
            // while (usedIds.has(hashId.substr(0, len))) len++;
            // module.id = hashId.substr(0, len);
            // usedIds.add(module.id);
          }
        }
      })
    });
    // async parellel hook
    compiler.hooks.make.tapAsync("init", function (compilation, done) {
      console.log("make", compilation);
      done();
    });
    // sync bail hook
    compiler.hooks.shouldEmit.tap("init", function (compilation) {
      console.log("shouldEmit", compilation);
      // return false; // 如果返回false，不输出chunk
    });
    compiler.hooks.emit.tapAsync("init", function (compilation, done) {
      console.log("emit", compilation);
      done();
    });
    compiler.hooks.assetEmitted.tapAsync(
      "init",
      function (chunkFilename, fileUint8Array, done) {
        // 只要有一个chunk，这个回调就会执行一次
        console.log("assetEmitted", chunkFilename, fileUint8Array);
        done();
      }
    );
    compiler.hooks.afterEmit.tapAsync("init", function (compilation, done) {
      console.log("afterEmit", compilation);
      done();
    });
    compiler.hooks.done.tapAsync("init", function (state, done) {
      // state 是 State 的实例
      const { compilation, hash, startTime, endTime } = state;
      /**
       * state = {
       *  toString() => 本次编译的 说明，hash、webpack的版本、输出的chunk等等
       *  toJson() => { errors: [ string, ], warnings: [ string, ], versions: '4.46.0', hash: '12d1', ... }
       *  formatFilePath()
       *  hasErrors()  => true false
       *  hasWarnings() => true false
       * }
       *
       */
      console.log("done", state);
      done();
    });


    // 以下是异常时才会执行
    compiler.hooks.watchClose.tap("init", function () {
      console.log("watchClose", arguments);
    });
    compiler.hooks.invalid.tap("init", function () {
      console.log("invalid", arguments);
    });
    compiler.hooks.failed.tap("init", function () {
      console.log("failed", arguments);
    });

    /**
     * SyncBailHook: [ entryOption, shouldEmit, infrastructurelog, infrastructureLog ]
     *
     * 只要一个回调返回的不是 undefined 就停止顺序执行
     *
     * hook = {
     *  taps, // 缓存注册的回调
     *  promise,
     *
     *  call,
     *  callAsync,
     *
     *  tap,
     *  tapAsync, // 调用会报错
     *  tapPromise, // 调用会报错
     * }
     *
     * 回调函数中 this 是 undefined
     */

    compiler.hooks.infrastructurelog.tap("init", function () {
      console.log("infrastructurelog", arguments);
    });
    compiler.hooks.infrastructureLog.tap("init", function () {
      console.log("infrastructureLog", arguments);
    });

    

    /**
     * AsyncParallelHook:  [ make ]
     *
     * 一起执行
     *
     * hook = {
     *  taps, // 缓存注册的回调
     *  promise,
     *
     *  call,
     *  callAsync,
     *
     *  tap,
     *  tapAsync,
     *  tapPromise,
     * }
     *
     * 回调函数中 this 是 undefined
     */

    /**
     * AsyncSeriesHook: [
     *    additionalPass, beforeCompile, beforeRun, run, emit, afterEmit, assetEmitted, done,
     *    watchRun
     * ]
     *
     * 只要一个回调返回的不是 undefined 就停止顺序执行
     *
     * hook = {
     *  taps, // 缓存注册的回调
     *  promise,
     *
     *  call,
     *  callAsync,
     *
     *  tap,
     *  tapAsync, // 调用会报错
     *  tapPromise, // 调用会报错
     * }
     *
     * 回调函数中 this 是 undefined
     */

    compiler.hooks.additionalPass.tapAsync(
      "init",
      function (compilation, done) {
        console.log("additionalPass", arguments);
        done();
      }
    );


    // todo: make execute here !!!
    // todo: shouldEmit execute here !!!

    

    compiler.hooks.watchRun.tapAsync("init", function (compilation, done) {
      console.log("watchRun", arguments);
      done();
    });
  }
};
