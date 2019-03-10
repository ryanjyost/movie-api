const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Fetch a single MM group
*/
const getGroup = async (query = {}, populate = "") => {
  try {
    let err, group;
    [err, group] = await to(Group.findOne(query).populate(populate));
    if (err) throw new Error(err);
    return group;
  } catch (e) {
    console.log(e);
  }
};

module.exports = getGroup;
