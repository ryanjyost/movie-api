const { Seasons } = require("../../src");

module.exports = async (req, res) => {
  const seasons = await Seasons.getSeasons();
  res.json({ seasons });
};
