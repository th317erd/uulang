const { flattenArrayToString } = require('./generator-utils');

function UULangToJavascriptGenerator() {
  function iterateChildren(children) {
    var result = [];

    for (var i = 0, il = children.length; i < il; i++) {
      var child     = children[i],
          typeName  = child.typeName,
          converter = typeConverters[typeName];

      if (typeof converter !== 'function')
        throw new Error(`Generators.UULangToJavascriptGenerator.generate: Do know know how to convert type \`${typeName}\``);

      result.push(converter(child));
    }

    return flattenArrayToString(result, (item) => (typeof item === 'string'));
  }

  function WhiteSpace() {
    return ' ';
  }

  function StringLiteral(token) {

  }

  function Identifier(token) {

  }

  function Operator(token) {

  }

  function Program(token) {
    return `(function() {\n  ${iterateChildren(token.children)}\n})();`;
  }

  const typeConverters = {
    WhiteSpace,
    StringLiteral,
    Identifier,
    Operator,
    Program
  };

  function generate(ast) {
    if (ast.typeName !== 'Program')
      throw new TypeError('Generators.UULangToJavascriptGenerator.generate: First node must be of typeName `Program`');

    return Program(ast);
  }

  return {
    generate
  };
}

module.exports = {
  UULangToJavascriptGenerator
};
