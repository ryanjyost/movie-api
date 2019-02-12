const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Fetch groups
*/
const getGroups = async query => {
  let group;
  [err, group] = await to(Group.find(query));

  if (err) throw new Error("Could not find any groups.");

  return group;
};

module.exports = getGroups;
