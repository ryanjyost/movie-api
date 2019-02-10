const Group = require("../model.js");

/*
* Add new user to the group
*/

const addUserToGroup = async (userId, groupmeId) => {
  let err, group;
  [err, group] = await to(
    Group.findOneAndUpdate({ groupmeId }, { $push: { members: userId } })
  );
};

module.exports = addUserToGroup;
