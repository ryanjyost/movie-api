const { Groups } = require("../../src");

module.exports = getGroup = async (req, res, next) => {
  const group = await Groups.getGroup({ _id: req.params.id }, "members");
  res.json({ group });
};
