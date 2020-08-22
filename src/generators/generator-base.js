const { flattenArrayToString } = require('./generator-utils');

class GeneratorBase {
  constructor(_opts) {
    var opts = _opts || {};

    Object.defineProperties(this, {
      _options: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: opts
      }
    });
  }

  getOptions() {
    return this._options;
  }

  iterateChildren(_children) {
    var children  = _children,
        result    = [];

    if (!(children instanceof Array))
      children = [ children ];

    for (var i = 0, il = children.length; i < il; i++) {
      var child = children[i];
      if (!child)
        continue;

      var typeName  = child.typeName,
          converter = (typeName.match(/^[A-Z]/)) ? this[typeName] : null;

      if (typeof converter !== 'function')
        throw new Error(`Generators.${this.constructor.name}.generate: Do know know how to convert type \`${typeName}\``);

      result.push(converter.call(this, child));
    }

    return flattenArrayToString(result, (item) => (typeof item === 'string'));
  }

  generate(ast) {
    if (ast.typeName !== 'Program')
      throw new TypeError(`Generators.${this.constructor.name}.generate: First node must be of typeName \`Program\``);

    return this.Program.call(this, ast);
  }
}

module.exports = {
  GeneratorBase
};
