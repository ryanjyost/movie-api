const Group = require("../model.js");
const { findOrCreateUser } = require("../../users");

/*
* Create an MM group from GroupMe group
*/
module.exports = async (groupmeGroupData, extraData) => {
  // start building new group
  let newGroup = {
    name: groupmeGroupData.name,
    groupmeId: groupmeGroupData.group_id,
    groupme: { ...groupmeGroupData },
    bot: groupmeGroupData.bot
  };

  //...loop through GroupMe members and find or create MM users
  let membersForGroup = [];
  const members = groupmeGroupData.members;
  let arrayOfUsers = [];
  for (let member of members) {
    const user = await findOrCreateUser(member, null, true);
    // add user ids to new group
    if (user) {
      membersForGroup.push(user._id);
      arrayOfUsers.push(user);
    }
  }

  newGroup.members = membersForGroup;

  // actually create the MM group
  const createdGroup = await Group.create(newGroup);

  for (let user of arrayOfUsers) {
    if (user.groups.indexOf(createdGroup._id) < 0) {
      user.groups = [...user.groups, ...[createdGroup._id]];
      user.save();
    }
  }

  return createdGroup;
};
