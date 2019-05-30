const { Groups } = require("../../index");

module.exports = getGroup = async (req, res) => {
  const group = await Groups.getGroup({ _id: req.params.id }, "members");
  res.json({ group });
};
