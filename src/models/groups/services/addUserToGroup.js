const Group = require("../model.js");

module.exports = async (userId, query) => {
  return await Group.findOneAndUpdate(query, { $push: { members: userId } });
};
