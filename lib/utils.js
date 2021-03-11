const path = require("path");
const fs = require("fs");

const makeDirp = (dirname) => {
  if (fs.existsSync(dirname)) return;
  try {
    fs.mkdirSync(dirname); // 如果dirname已经有了也会报错
    return;
  } catch (e) {
    makeDirp(path.dirname(dirname));
  }
  makeDirp(dirname);
};

const writeFile = (filename, content) => {
  makeDirp(path.dirname(filename));
  fs.createWriteStream(filename).write(content);
};

const readFile = (absPath) => {
  try {
    return fs.readFileSync(absPath, { encoding: "utf-8" });
  } catch (e) {
    console.log(e.toString());
  }
};

module.exports.makeDirp = makeDirp;
module.exports.writeFile = writeFile;
module.exports.readFile = readFile;
