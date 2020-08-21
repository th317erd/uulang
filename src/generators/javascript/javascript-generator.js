const { flattenArrayToString } = require('../generator-utils');

function JavascriptGenerator() {
  // TODO: Convert to class

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
    return `${CURRENT_SCOPE_VAR}['${token.id.name.replace(/([^\\])'/g, '\\\'')}'] = ${iterateChildren(token.init)};`;
  }

  function Program(token) {
    return `(function(${CURRENT_SCOPE_VAR}) {\n  ${iterateChildren(token.children)}\n})({});`;
  }

  function FunctionDeclarator(token) {
    var name = (token.id) ? ` ${token.id.name}` : '';
    return `function${name}(${CURRENT_SCOPE_VAR}){${iterateChildren(token.children)}}`;
  }

  function FunctionBody(token) {
    return iterateChildren(token.children);
  }

  const typeConverters = {
    WhiteSpace,
    NumericLiteral,
    StringLiteral,
    Identifier,
    Operator,
    VariableDeclarator,
    Program,
    FunctionDeclarator,
    FunctionBody
  };

  function generate(ast) {
    if (ast.typeName !== 'Program')
      throw new TypeError('Generators.JavascriptGenerator.generate: First node must be of typeName `Program`');

    return Program(ast);
  }

  const CURRENT_SCOPE_VAR = 'cs';

  return {
    generate
  };
}

module.exports = {
  JavascriptGenerator
};
