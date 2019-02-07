const Group = require("../../groups/model.js");

/*
* Add new user to the group
*/

module.exports = async (userId, groupmeId) => {
  let err, group;
  [err, group] = await to(
    Group.findOneAndUpdate({ groupmeId }, { $push: { members: userId } })
  );
};
