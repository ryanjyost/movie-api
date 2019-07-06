const assert = require("assert");
const data = require("./fixtures/sortAndAddPlacesToData");
const sortAndAddPlacesToData = require("../src/util/sortAndAddPlacesToData");

describe("Sorting and adding places to data", function() {
  describe("Sorting and adding single movie results ", function() {
    it("should be sorted properly", function() {
      const resultsA = sortAndAddPlacesToData(data.a, "absDiff", true);
      assert.equal(resultsA[1].place, resultsA[2].place);
    });

    it("should give 2nd place to users with same prediction", function() {
      const resultsA = sortAndAddPlacesToData(data.a, "absDiff", true);
      assert.equal(resultsA[1].place, resultsA[2].place);
    });

    it("should give 1st place to users with same prediction", function() {
      const resultsB = sortAndAddPlacesToData(data.b, "absDiff", true);
      assert.equal(resultsB[0].place, resultsB[1].place);
    });

    it("should give same points to users with same prediction", function() {
      const resultsA = sortAndAddPlacesToData(data.a, "absDiff", true);
      assert.equal(resultsA[1].points, resultsA[2].points);

      const resultsB = sortAndAddPlacesToData(data.b, "absDiff", true);
      assert.equal(resultsB[0].points, resultsB[1].points);
    });
  });
});
