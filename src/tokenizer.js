import { definePropertyRO, definePropertyRW, noe, isValidNum } from './utils';
import Position from './position';
import Token from './token';
import TokenStream from './token-stream';
import { convertToTokenParser, createTokenParser, isSuccessful, loop, REGEXP, EQ, ALIAS } from './parser-engine';

const REPEAT = createTokenParser(function(_getter, _min, _max) {
  var getter = convertToTokenParser(_getter),
      min = (_min === undefined) ? 0 : _min,
      max = (_max === undefined) ? Infinity : _max;

  if (arguments.length === 2)
    max = min;

  return loop.call(this, (index, done) => {
    //console.log('LOOPING!!', index);
    if (index >= max)
      return done();

    var val = getter.call(this);
    if (!val.success) {
      if (index >= min)
        return done();

      return done(null);
    }
    
    return val;
  });
}, function(result) {
  if (!result || result.length === 0)
    return;

  return new Token({
    type: 'REPEAT',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

const OR = createTokenParser(function(...parsers) {
  for (var i = 0, il = parsers.length; i < il; i++) {
    var parser = convertToTokenParser(parsers[i]),
        value = parser.call(this);
    
    if (value.success)
      return value;
  }
});

const AND = createTokenParser(function(...parsers) {
  var results = [];

  for (var i = 0, il = parsers.length; i < il; i++) {
    var parser = convertToTokenParser(parsers[i]),
        value = parser.call(this);
    
    if (!value.success)
      return;

    results.push(value);
  }

  return results;
}, function(result) {
  if (!result || result.length === 0)
    return;

  return new Token({
    type: 'AND',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

const MY_TOKEN = ALIAS(AND(/\w+/, /\s+/, /\w+/), 'MY_TOKEN');

// TODO: Make this work
//const STRING_DQ = AND('"', REPEAT(NOT(AND('\\', REPEAT(/./, 1)))), '"')

var src = new TokenStream('This stuff derp hello');
console.log(
  REPEAT(MY_TOKEN).call(src)
);

// function createFunctionToken(name, func, resultFormatter) {
//   return function(...args) {
//     class FuncToken extends Token {
//       constructor() {
//         super(name);
//       }
  
//       match(stream) {
//         var startPos = stream.position(),
//             streamClone = new TokenStream(stream);

//         var ret = func.call(this, streamClone, ...(args || []));
        
//         if (ret instanceof Result) {
//           var endPos = streamClone.getPosition();
          
//           if (ret.position)
//             endPos = ret.position;
//           else
//             definePropertyRW(ret, 'position', new Position(startPos, endPos));

//           if (endPos.range(startPos) !== 0 && ret.success) {
//             if (!ret.hasOwnProperty('rawValue'))
//               ret.rawValue = stream.get(ret.position);

//             stream.seek(endPos.end || endPos.start);
//           }
//         }
        
//         return (ret && resultFormatter instanceof Function) ? resultFormatter(ret) : ret;
//       }
//     };

//     return new FuncToken();
//   };
// }

// function createREToken(name, _regexp, _matchIndex, resultFormatter) {
//   function getFlags(flags) {
//     var finalFlags = [];
//     for (var i = 0, il = flags.length; i < il; i++) {
//       var flag = flags.charAt(i);
//       if (finalFlags.indexOf(flag) < 0)
//         finalFlags.push(flag);
//     }

//     if (finalFlags.indexOf('g') < 0)
//       finalFlags.push('g');

//     return finalFlags;
//   }

//   var regexp = (_regexp instanceof String || typeof _regexp === 'string') ? new RegExp(_regexp, 'g') : _regexp,
//       reSource = regexp.source,
//       reFlags = getFlags(regexp.flags),
//       matchIndex = _matchIndex || 1;

//   return function(...args) {
//     var RE = new RegExp(reSource, reFlags);
//     class RegExpToken extends Token {
//       constructor() {
//         super(name);
  
//         definePropertyRO(this, '_regexp', RE);
//       }
  
//       match(stream) {
//         var startPos = stream.position();
//         RE.lastIndex = startPos;
  
//         var str = stream.toString(),
//             match = RE.exec(str);
  
//         //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
//         if (match && match.index === startPos) {
//           var endPos = startPos + match[0].length;
//           stream.seekRaw(endPos);
  
//           var result = new Result({
//             type: name,
//             source: stream,
//             position: new Position(startPos, endPos),
//             value: (matchIndex instanceof Function) ? matchIndex.call(this, ...match, startPos, stream) : (match[matchIndex] || match[0]),
//             rawValue: match,
//             success: true
//           });

//           return (resultFormatter instanceof Function) ? resultFormatter(result) : result;
//         }
//       }
//     };

//     return new RegExpToken();
//   };
// }

// function createToken(name, helper, ...args) {
//   if (helper instanceof RegExp || (helper instanceof String || typeof helper === 'string')) {
//     return createREToken(name, helper, ...args);
//   } else if (helper instanceof Function) {
//     return createFunctionToken(name, helper, ...args);
//   } else if (helper instanceof Array) {
//     return function() {
//       return ALL(...helper);
//     };
//   }
// }

// const ALL = createFunctionToken('ALL', function(stream, ...args) {
//         var tokens = [].concat(...args),
//             finalResult = [],
//             success = true;
        
//         for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
//           var token = tokens[i];
//           if (!token || !(token instanceof Token))
//             continue;

//           var match = token.match(stream);
//           if (!match || (match instanceof Result && !match.success)) {
//             success = false;
//             break;
//           }

//           finalResult = finalResult.concat(match);
//         }

//         return new Result({
//           type: 'ALL',
//           source: stream,
//           value: finalResult,
//           success: success
//         });
//       }, (result) => (result.success && result.value)),
//       ANY = createFunctionToken('ANY', function(stream, ...args) {
//         var tokens = [].concat(...args),
//             finalResult = [];
        
//         for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
//           var token = tokens[i];
//           if (!token || !(token instanceof Token))
//             continue;

//           var match = token.match(stream);
//           if (!match || (match instanceof Result && !match.success))
//             continue;

//           finalResult = finalResult.concat(match);
//         }

//         return new Result({
//           type: 'ANY',
//           source: stream,
//           value: finalResult,
//           success: (finalResult.length > 0)
//         });
//       }, (result) => (result.success && result.value)),
//       REPEAT = createFunctionToken('REPEAT', function(stream, token, min, max) {
//         var finalResult = [],
//             success = false;

//         if (token && (token instanceof Token)) {
//           success = true;

//           while(!stream.eof()) {
//             var match = token.match(stream);
//             if (!match || (match instanceof Result && !match.success))
//               break;

//             finalResult = finalResult.concat(match);
//           }
//         }
        
//         if (min && finalResult.length < min)
//           success = false;

//         if (max && finalResult.length > max)
//           success = false;

//         return new Result({
//           type: 'REPEAT',
//           source: stream,
//           value: finalResult,
//           success: success
//         });
//       }, (result) => (result.success && result.value)),
//       NOT = createFunctionToken('NOT', function(stream, token) {
//         var ret = (token && token instanceof Token) ? token.match(stream) : token;

//         if (ret instanceof Result && !ret.success) {
//           return new Result(Object.assign({}, ret, {
//             type: ret.type,
//             source: stream,
//             position: ret.position,
//             value: ret.value,
//             rawValue: ret.value,
//             success: true
//           }));
//         }
//       }),
//       FIRST = createFunctionToken('FIRST', function(stream, ...args) {
//         var tokens = [].concat(...args),
//             finalResult;
        
//         for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
//           var token = tokens[i];
//           if (!token || !(token instanceof Token))
//             continue;

//           var match = token.match(stream);
//           if (!match || (match instanceof Result && !match.success))
//             continue;

//           finalResult = match;
//           break;
//         }

//         if (!finalResult)
//           return;

//         return new Result({
//           type: finalResult.type,
//           source: stream,
//           value: finalResult.value,
//           rawValue: finalResult.rawValue,
//           success: finalResult.success
//         });
//       }),
//       WHITESPACE = createREToken('WHITESPACE', /(\s+)/),
//       CHAR = createFunctionToken('CHAR', function(stream, matchChar) {
//         var firstToken = stream.get(),
//             success = true;
        
//         if (matchChar) {
//           var matchCharValue = (matchChar instanceof Result) ? matchChar.value : matchChar,
//               firstTokenValue = (firstToken instanceof Result) ? firstToken.value : firstToken;

//           if (firstTokenValue !== matchCharValue)
//             success = false;
//         }

//         return new Result({
//           type: 'CHAR',
//           source: stream,
//           value: firstToken.toString(),
//           success: success
//         });
//       }),
//       WORD = createREToken('WORD', /(\w+)/),
//       REGEXP = function(regexp) {
//         return new (createREToken('REGEXP', regexp))();
//       },
//       FOLLOWING = createFunctionToken('FOLLOWING', function(stream, token) {
//         var value = ALL(
//               token,
//               CHAR()
//             ).match(stream);
        
//         if (!value || (value instanceof Result && !value.success))
//           return;

//         return new Result({
//           type: 'FOLLOWING',
//           source: stream,
//           value: value[1],
//           success: true
//         });
//       }, (result) => (result.success && result.value));

// function stringMatcherFactory(tokenType, stringChar) {
//   return createFunctionToken('STRING', function(stream) {
//     debugger;

//     var value = ALL(
//           CHAR(stringChar),
//           REPEAT(FIRST(FOLLOWING(CHAR('\\')), NOT(CHAR(stringChar)))),
//           CHAR(stringChar)
//         ).match(stream);

//     if (!value || (value instanceof Result && !value.success))
//       return;

//     return new Result({
//       type: 'STRING',
//       source: stream,
//       value: value.slice(1, -1).join(''),
//       success: !!value
//     });
//   });
// }

// const TOKENS = {
//   ALL,
//   ANY,
//   NOT,
//   REPEAT,
//   FIRST,
//   WHITESPACE,
//   CHAR,
//   WORD,
//   FOLLOWING,
//   REGEXP,
//   STRING_DQ: stringMatcherFactory('STRING_DQ', '"'),
//   STRING_SQ: stringMatcherFactory('STRING_SQ', "'"),
//   STRING_BT: stringMatcherFactory('STRING_BT', "`")
// };

// function parse(_stream, token) {
//   if (!token || !(token instanceof Token))
//     return;

//   return token.match(new TokenStream(_stream));
// }

// module.exports = Object.assign({
//   Position,
//   Token,
//   Result,
//   TokenStream,
//   createToken,
//   parse,
//   TOKENS
// }, TOKENS);
