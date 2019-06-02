const MovieScoreMap = require("./model");

module.exports = {
  get: async () => MovieScoreMap.findOne({ id: 1 }),
  update: async updatedMap => {
    return await MovieScoreMap.findOneAndUpdate(
      { id: 1 },
      { $set: { map: updatedMap, id: 1 } }
    );
  }
};
