const { Groups } = require("../../index");

module.exports = async (req, res) => {
  const rankings = await Groups.getSeasonBreakdowns(
    req.params.groupId === "all" ? null : { _id: req.params.groupId },
    req.params.seasonId || { _id: req.params.seasonId }
  );

  res.json({ rankings });
};
