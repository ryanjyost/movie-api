const Services = require("../../src");

module.exports = getGroup = async (req, res, next) => {
  const group = await Services.groups.getGroup(
    { _id: req.params.id },
    "members"
  );

  res.json({ group });
};
