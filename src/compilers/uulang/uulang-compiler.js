const { flattenArrayToString } = require('../generator-utils');

function UULangCompiler() {
  function compile(ast) {
    if (ast.typeName !== 'Program')
      throw new TypeError('Compilers.UULangCompiler.compile: First node must be of typeName `Program`');

    return ast;
  }

  return {
    compile
  };
}

module.exports = {
  UULangCompiler
};
