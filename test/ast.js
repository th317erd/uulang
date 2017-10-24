import util from 'util';
import * as babel from 'babel-core';

babel.transformFile(require.resolve('./test.js'), {
}, function (err, result) {
  console.log(util.inspect(result.ast.tokens, {
    depth: null,
    colors: true
  }));
});
