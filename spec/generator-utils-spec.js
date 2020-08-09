const { Generators }      = require('./lib');
const { GeneratorUtils }  = Generators;

describe("GeneratorUtils", function() {
  describe("flattenArray", function() {
    it("should be able to flatten arrays", function() {
      var array1 = [ 'test', [ 'something', 'else', [ 'for', [ 'now' ] ], 'for' ], 'sure' ];
      expect(GeneratorUtils.flattenArray(array1)).toEqual([ 'test', 'something', 'else', 'for', 'now', 'for', 'sure' ]);
    });
  });

  describe("flattenArrayToString", function() {
    it("should be able to flatten arrays into strings", function() {
      var array1 = [ 'test', [ 'something', 'else', [ 'for', [ 'now' ] ], 'for' ], 'sure' ];
      expect(GeneratorUtils.flattenArrayToString(array1)).toBe('testsomethingelsefornowforsure');
    });

    it("should be able to flatten arrays into strings using a filter", function() {
      var array1 = [ 'test', [ 'something', 5, 'else', [ true, 'for', [ 'now', 10 ] ], 'for' ], false, 'sure' ];
      expect(GeneratorUtils.flattenArrayToString(array1)).toBe('testsomething5elsetruefornow10forfalsesure');
      expect(GeneratorUtils.flattenArrayToString(array1, (item) => (typeof item === 'string'))).toBe('testsomethingelsefornowforsure');
    });

    it("should be able to flatten arrays into strings specifying a separator", function() {
      var array1 = [ 'test', [ 'something', 'else', [ 'for', [ 'now' ] ], 'for' ], 'sure' ];
      expect(GeneratorUtils.flattenArrayToString(array1, undefined, ' ')).toBe('test something else for now for sure');
    });
  });
});
