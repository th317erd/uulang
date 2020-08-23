const { GeneratorBase }        = require('../generator-base');

const CURRENT_SCOPE_VARIABLE_NAME = 'cs';

class JavascriptGenerator extends GeneratorBase {
  constructor(_opts) {
    super(Object.assign({
      currentScopeVariableName: CURRENT_SCOPE_VARIABLE_NAME
    }, _opts || {}));
  }

  getCurrentScopeVariableName() {
    return this.getOptions().currentScopeVariableName;
  }

  WhiteSpace() {
    return ' ';
  }

  NumericLiteral(token) {
    return `${token.value}`;
  }

  StringLiteral(token) {
    return `"${token.value}"`;
  }

  Identifier(token) {
    return `${this.getCurrentScopeVariableName()}['${token.name}']`;
  }

  Operator(token) {
    return token[0];
  }

  AssignmentExpression(token) {
    return `${this.iterateChildren(token.left)} = ${this.iterateChildren([ token.right ])};`;
  }

  MemberExpression(token) {
    if (token.object.typeName === 'MemberExpression') {
      return `${this.MemberExpression(token.object)}['${token.property.name}']`;
    } else {
      return `${this.Identifier(token.object)}['${token.property.name}']`;
    }
  }

  VariableDeclarator(token) {
    return `${this.getCurrentScopeVariableName()}['${token.id.name.replace(/([^\\])'/g, '\\\'')}'] = ${this.iterateChildren(token.init)};`;
  }

  Program(token) {
    return `(function(${this.getCurrentScopeVariableName()}) {\n  ${this.iterateChildren(token.children)}\n})({});`;
  }

  FunctionDeclarator(token) {
    var name = (token.id) ? ` ${token.id.name}` : '';
    return `function${name}(${this.getCurrentScopeVariableName()}){${this.iterateChildren(token.children)}}`;
  }

  FunctionBody(token) {
    return this.iterateChildren(token.children);
  }
}

module.exports = {
  JavascriptGenerator
};
