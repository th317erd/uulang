const { Token }           = require('adextopa'),
      { loadTestSource }  = require('./test-utils'),
      { transform }       = require('./lib');

describe("Transform", function() {
  it("should be able to transform input", function(done) {
    var source = loadTestSource('test');

    var result = transform(source, {}, (err, token) => {
      if (err) {
        debugger;
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);
      debugger;

      done();
    });
  });
});
