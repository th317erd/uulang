module.exports = Object.assign({},
  { Parsers:    require('./parsers') },
  { Generators: require('./generators') },
  require('./transform'),
  require('./transform-file'),
);
