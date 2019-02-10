const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Fetch a single MM group
*/
const getGroup = async groupMeId => {
  let group;
  [err, group] = await to(Group.findOne({ groupmeId: groupMeId }));

  if (err) throw new Error("Could not find group.");

  return group;
};

module.exports = getGroup;
