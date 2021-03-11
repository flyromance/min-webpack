const loaderUtils = require('loader-utils');

module.exports = async function (source) {
    const loaderContext = this;
    const cb = this.async();


    cb(null, 'var a = 1;');
}
