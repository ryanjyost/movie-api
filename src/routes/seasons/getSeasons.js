const { Seasons } = require("../../index");

module.exports = async (req, res) => {
  const seasons = await Seasons.getSeasons();
  res.json({ seasons });
};
