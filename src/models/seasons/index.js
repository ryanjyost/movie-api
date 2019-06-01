const Season = require("./model");

module.exports = {
  findRecentSeason: async () => {
    const seasons = await Season.find().sort({ id: -1 });
    return seasons[0] || null;
  },
  getSeasons: require("./services/getSeasons"),
  getSeason: require("./services/getSeason")
};
