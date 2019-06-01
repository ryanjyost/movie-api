const Group = require("./model");

module.exports = {
  createGroup: async newGroupData => {
    return await Group.create(newGroupData);
  },
  getGroup: async (query = {}, populate = "") => {
    return await Group.findOne(query).populate(populate);
  },
  getGroupById: async id => {
    return await Group.findOne({ _id: id }).populate("members");
  },
  getGroups: require("./services/getGroups.js"),
  addUserToGroup: require("./services/addUserToGroup.js"),
  prepSortGroupPredictions: require("./services/prepSortGroupPredictions")
};

// just pass method up service layer if super simple
