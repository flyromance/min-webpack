const babel = require('@babel/core');

module.exports = function(source) {
    const loaderContext = this;

    const { code } = babel.transform(source, {
        
    });

    return code;
}
