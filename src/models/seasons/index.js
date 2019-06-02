const Season = require("./model");

module.exports = {
  findRecentSeason: async () => {
    const seasons = await Season.find().sort({ id: -1 });
    return seasons[0] || null;
  },
  createNewSeason: async newSeasonId => {
    return await Season.create({
      id: newSeasonId,
      movies: [],
      length: 5,
      winnerMap: { placeholder: 1 }
    });
  },
  findSeasonById: async id => {
    return await Season.findOne({ id });
  },
  getSeasons: require("./services/getSeasons"),
  getSeason: require("./services/getSeason")
};
