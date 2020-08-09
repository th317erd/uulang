const { CUSTOM_MATCHERS }       = require('./test-utils');

const { Token }                 = require('adextopa'),
      { loadTestSource }        = require('./test-utils'),
      { Generators, transform } = require('./lib');

const { UULangToJavascriptGenerator } = Generators;

describe("Transform", function() {
  beforeEach(function() {
    jasmine.addMatchers(CUSTOM_MATCHERS);
  });

  it("should be able to transform input", function(done) {
    var source    = loadTestSource('variable-declaration'),
        generator = UULangToJavascriptGenerator();

    transform(source, {}, (err, token) => {
      if (err) {
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);
      var generatedResult = generator.generate(token);
      expect(generatedResult).toMatchSnapshot();

      done();
    });
  });
});
