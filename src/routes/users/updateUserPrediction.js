const { Users } = require("../../index");

module.exports = async (req, res) => {
  const user = await Users.getUser(
    { _id: req.body.userId },
    {},
    { path: "groups", populate: { path: "members" } }
  );

  user.votes =
    "votes" in user
      ? {
          ...user.votes,
          ...{ [req.params.movieId]: Number(req.body.prediction) }
        }
      : { [req.params.movieId]: Number(req.body.prediction) };

  const updatedUser = await user.save();

  res.json({ user: updatedUser });
};
