const { flattenArrayToString } = require('../generator-utils');

function JavascriptGenerator() {
  function iterateChildren(_children) {
    var children  = _children,
        result    = [];

    if (!(children instanceof Array))
      children = [ children ];

    for (var i = 0, il = children.length; i < il; i++) {
      var child = children[i];
      if (!child)
        continue;

      var typeName  = child.typeName,
          converter = typeConverters[typeName];

      if (typeof converter !== 'function')
        throw new Error(`Generators.JavascriptGenerator.generate: Do know know how to convert type \`${typeName}\``);

      result.push(converter(child));
    }

    return flattenArrayToString(result, (item) => (typeof item === 'string'));
  }

  function WhiteSpace() {
    return ' ';
  }

  function NumericLiteral(token) {
    return `${token.value}`;
  }

  function StringLiteral(token) {
    return `"${token.value}"`;
  }

  function Identifier(token) {
    return token.value;
  }

  function Operator(token) {
    return token[0];
  }

  function VariableDeclarator(token) {
    return `let ${token.id.name} = ${iterateChildren(token.init)};`;
  }

  function Program(token) {
    return `(function() {\n  ${iterateChildren(token.children)}\n})();`;
  }

  const typeConverters = {
    WhiteSpace,
    NumericLiteral,
    StringLiteral,
    Identifier,
    Operator,
    VariableDeclarator,
    Program
  };

  function generate(ast) {
    if (ast.typeName !== 'Program')
      throw new TypeError('Generators.JavascriptGenerator.generate: First node must be of typeName `Program`');

    return Program(ast);
  }

  return {
    generate
  };
}

module.exports = {
  JavascriptGenerator
};
