const { Users } = require("../../src");

module.exports = async (req, res) => {
  const existingUser = await Users.getUser(
    { _id: req.params.id },
    {},
    { path: "groups", populate: { path: "members" } }
  );

  res.json({ user: existingUser });
};
