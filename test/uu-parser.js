import util from 'util';
import { transformFile } from '../src/main';

transformFile(require.resolve('./test.uu'), {

}, function(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  console.log(util.inspect(result, {
    depth: null,
    colors: true
  }));
});
