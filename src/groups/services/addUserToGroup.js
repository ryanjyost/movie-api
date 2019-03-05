const Group = require("../model.js");
const { to } = require("../../helpers");

/*
* Add new user to the group
*/

const addUserToGroup = async (userId, query) => {
  try {
    console.log("ADD TO GROUP", userId, query);
    await to(Group.findOneAndUpdate(query, { $push: { members: userId } }));
  } catch (e) {
    console.log(e);
  }
};

module.exports = addUserToGroup;
