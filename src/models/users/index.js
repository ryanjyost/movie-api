const User = require("./model");

module.exports = {
  findUserByGroupMeId: async groupmeId => {
    return await User.findOne({ groupmeId }).populate({
      path: "groups",
      populate: { path: "members" }
    });
  },
  findAllUsers: async () => User.find(),
  updateUserVoteMaps: require("./services/updateUserVoteMaps"),
  findOrCreateUser: require("./findOrCreateUser"),
  getUsers: require("./services/getUsers"),
  getUser: require("./services/getUser")
};
