import fs from 'fs';
import { Tokenizer } from 'adextopa';
import { UULANG } from './parsers/uulang';

export const DEFAULT_OPTIONS = {
};

export function transform(_source, _opts, cb) {
  var source = _source.toString(),
      opts = {
        ...DEFAULT_OPTIONS,
        ...(_opts || {})
      };
  
  var tokenizer = new Tokenizer(UULANG, opts);
  return tokenizer.parse(source, function(err, result) {
    cb(err, result);
  });
}

export function transformFile(fileName, opts, cb) {
  return fs.readFile(fileName, 'utf8', function(err, data) {
    transform(data, opts, cb);
  });
}
