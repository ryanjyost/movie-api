const User = require("./model");

module.exports = {
  findUserByGroupMeId: async groupmeId => {
    return await User.findOne({ groupmeId }).populate({
      path: "groups",
      populate: { path: "members" }
    });
  },
  findAllUsers: async () => User.find(),
  updateUserVoteMaps: async movieId => {
    // this updates any user that hasn't predicted with a placeholder of -1
    return await User.update(
      { [`votes.${movieId}`]: { $exists: false } },
      { $set: { [`votes.${movieId}`]: -1 } },
      { multi: true }
    );
  },
  findOrCreateUser: require("./findOrCreateUser"),
  getUsers: require("./services/getUsers"),
  getUser: require("./services/getUser")
};
