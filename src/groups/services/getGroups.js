const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Fetch groups
*/
const getGroups = async (query = {}, populate = null) => {
  let err, groups;
  [err, groups] = await to(Group.find(query).populate(populate));

  if (err) throw new Error("Could not find any groups.");

  return groups;
};

module.exports = getGroups;
