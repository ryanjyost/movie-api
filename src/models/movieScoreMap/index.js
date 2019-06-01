const MovieScoreMap = require("./model");

module.exports = {
  get: async () => MovieScoreMap.findOne({ id: 1 })
};
