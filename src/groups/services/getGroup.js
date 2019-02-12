const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Fetch a single MM group
*/
const getGroup = async query => {
  let group;
  [err, group] = await to(Group.findOne(query));

  if (err) throw new Error("Could not find group.");

  return group;
};

module.exports = getGroup;
