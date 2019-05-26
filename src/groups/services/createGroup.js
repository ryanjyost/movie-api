const { to } = require("../../../helpers");
const Group = require("../model.js");
const { findOrCreateUser } = require("../../users");
const GroupMe = require("../../platforms/groupme");

/*
* Create an MM group from GroupMe group
*/
const create = async (groupmeGroupData, extraData) => {
  try {
    // 46925214

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
      let err, user;
      [err, user] = await to(findOrCreateUser(member, null, true));
      // add user ids to new group
      if (user) {
        membersForGroup.push(user._id);
        arrayOfUsers.push(user);
      }
    }

    newGroup.members = membersForGroup;

    // actually create the MM group
    let err, createdGroup;
    [err, createdGroup] = await to(Group.create(newGroup));

    for (let user of arrayOfUsers) {
      if (user.groups.indexOf(createdGroup._id) < 0) {
        user.groups = [...user.groups, ...[createdGroup._id]];
        user.save();
      }
    }

    return createdGroup;
  } catch (e) {
    console.log("Error creating group", e);
  }
};

module.exports = create;
