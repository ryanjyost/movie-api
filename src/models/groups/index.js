const Group = require("./model");

module.exports = {
  createGroup: async newGroupData => {
    return await Group.create(newGroupData);
  },
  getGroup: async (query = {}, populate = "") => {
    return await Group.findOne(query).populate(populate);
  },
  findGroupById: async id => {
    return await Group.findOne({ _id: id }).populate("members");
  },
  findGroupByGroupMeId: async id => {
    return await Group.findOne({ groupmeId: id }).populate("members");
  },
  findAllGroups: async () => {
    return await Group.find().populate("members");
  },
  addUserToGroup: async (groupQuery, userId) => {
    return await Group.findOneAndUpdate(groupQuery, {
      $push: { members: userId }
    });
  },
  getGroups: require("./services/getGroups.js")
};
