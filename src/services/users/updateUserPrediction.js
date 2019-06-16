const { Users } = require("../../models");

module.exports = async (userId, movieId, prediction) => {
  const user = await Users.findUserById(userId);

  user.votes =
    "votes" in user
      ? {
          ...user.votes,
          ...{ [movieId]: Number(prediction) }
        }
      : { [movieId]: Number(prediction) };

  return await user.save();
};
