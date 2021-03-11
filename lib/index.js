const path = require("path");
const fs = require("fs");
const babel = require("@babel/core");
const traverse = require("@babel/traverse");
const ejs = require("ejs");
// const generator = require("@babel/generator");
// const t = require("@babel/types");

const { makeDirp, readFile, writeFile } = require("./utils");

const CWD = process.cwd();

// const { ast, code } = babel.transform(fileContent, {
//   plugins: ['@babel/plugin-transform-modules-commonjs'],
//   presets: [],
// });
// const { code: finalCode } = generator.default(ast, {});

class Compiler {
  modules = {}; // 模块映射
  entryModuleId = ""; // 入口模块id
  file = ""; // 打包后的代码

  constructor(options) {
    this.options = Object.assign({ context: CWD }, { ...options });
  }

  getUniPath(absPath) {
    const { context } = this.options;
    return path.relative(context, absPath);
  }

  parseFile(rawPath, isRoot) {
    const self = this;
    const { output, context } = this.options;
    const { path: outputPath } = output;

    const absPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.join(context, rawPath);

    const uniPath = this.getUniPath(absPath);

    if (this.modules[absPath]) {
      return;
    }

    if (isRoot) {
      this.entryModuleId = uniPath;
    }

    const module = {
      uniPath,
      absPath,
      deps: [],
      code: "",
      rawCode: "",
    };

    const fileContent = readFile(absPath);
    module.rawCode = fileContent;

    // 1、为了拿到依赖的模块路径，
    // 2、修改代码中的路径
    const ast = babel.parse(fileContent);
    traverse.default(ast, {
      enter(path) {
        // console.log(path.type);
      },
      ImportDeclaration(_path) {
        const { node } = _path;
        const sourcePath = _path.node.source.value;

        const absSourcePath = path.isAbsolute(sourcePath)
          ? sourcePath
          : path.join(path.dirname(absPath), sourcePath);
        const uniSourcePath = self.getUniPath(absSourcePath);

        _path.node.source.value = uniSourcePath;

        module.deps.push(uniSourcePath);
      },
    });

    const { code: transformedCode } = babel.transformFromAstSync(ast, "", {
      plugins: [
        "@babel/plugin-transform-modules-commonjs",
        // "@babel/plugin-transform-arrow-functions",
      ],
    });
    module.code = transformedCode;

    // loader

    this.modules[uniPath] = module;

    module.deps.forEach((uniPath) => {
      this.parseFile(uniPath);
    });
  }

  wrapperFn(str) {
    return "function (module, exports, require) {\n" + str + "\n}";
  }

  generatorModulesMap() {
    const { modules } = this;
    let str = "{";
    for (var moduleId in modules) {
      str +=
        "'" +
        moduleId +
        "'" +
        ": " +
        this.wrapperFn(modules[moduleId].code) +
        ",\n";
    }
    str += "}";

    return str;
  }

  generator() {
    const { output } = this.options;
    const { publicPath = "" } = output;

    // let template = fs.readFileSync(
    //   path.join(__dirname, "./template/main-chunk.ejs"),
    //   "utf-8"
    // );
    // this.file = ejs.render(template)({
    //   modules: this.modules,
    //   entry_module_id: this.entryModuleId,
    //   public_path: publicPath,
    // });

    let template = fs.readFileSync(
      path.join(__dirname, "./template/main-chunk.js"),
      "utf-8"
    );
    template = template.replace(
      "/* public_path */",
      JSON.stringify(publicPath)
    );
    template = template.replace(
      "/* entry_module_id */",
      '"' + this.entryModuleId + '"'
    );
    template = template.replace(
      "/* modules_map */",
      this.generatorModulesMap()
    );
    this.file = template;
  }

  emitFile(template) {
    const { output } = this.options;
    const { path: outputPath, filename } = output;

    writeFile(path.join(outputPath, filename), template || this.file);
  }

  run(cb) {
    try {
      this.parseFile(this.options.entry, true);
      this.generator(); // 生成输出代码
      this.emitFile(); // 生成文件
      cb(null, { modules: this.modules, file: this.file });
    } catch (e) {
      cb(e);
    }
    return this;
  }
}

const webpack = function (config = {}, cb) {
  const compiler = new Compiler(config);
  if (cb) {
    return compiler.run(cb);
  }
  return compiler;
};

webpack.Compiler = Compiler;

module.exports = webpack;
