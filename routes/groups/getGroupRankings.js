const { Lib } = require("../../src");

module.exports = async (req, res) => {
  const rankings = await Lib.calculateRankings(
    req.params.id === "all" ? null : { _id: req.params.id },
    req.params.seasonId ? { season: req.params.seasonId } : null
  );

  res.json({ rankings });
};
