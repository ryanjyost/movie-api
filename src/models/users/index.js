const User = require("./model");

module.exports = {
  findUserByGroupMeId: async groupmeId => {
    return await User.findOne({ groupmeId }).populate({
      path: "groups",
      populate: { path: "members" }
    });
  },
  findUserBySlackId: async slackId => {
    return await User.findOne({ slackId }).populate({
      path: "groups",
      populate: { path: "members" }
    });
  },
  findUserById: async (id, populate = true) => {
    if (populate) {
      return await User.findOne({ _id: id }).populate({
        path: "groups",
        populate: { path: "members" }
      });
    } else {
      return await User.findOne({ _id: id });
    }
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
  createUser: async userData => {
    return await User.create(userData);
  },
  addGroupToUser: async (userId, groupId) => {
    return await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { groups: groupId }
      }
    );
  },
  removeGroupFromUser: async (userId, groupId) => {
    return await User.update(
      { _id: userId },
      {
        $pull: { groups: { $in: [groupId] } }
      }
    );
  },
  removeUser: async userId => {
    return await User.remove({ _id: userId });
  },
  findOrCreateUser: require("./findOrCreateUser"),
  findOrCreateSlackUser: require("./findOrCreateSlackUser")
};
