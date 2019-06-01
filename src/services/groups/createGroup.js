const { Groups, Users } = require("../../models");

/*
* Create an MM group from GroupMe group
*/
module.exports = async groupmeGroupData => {
  // start building new group
  let newGroup = {
    name: groupmeGroupData.name,
    groupmeId: groupmeGroupData.group_id,
    groupme: { ...groupmeGroupData },
    bot: groupmeGroupData.bot,
    platform: "groupme"
  };

  //...loop through GroupMe members and find or create MM users
  let membersForGroup = [];
  let arrayOfUsers = [];

  const { members } = groupmeGroupData;
  for (let member of members) {
    const user = await Users.findOrCreateUser(member, null, true);
    // add user ids to new group
    if (user) {
      membersForGroup.push(user._id);
      arrayOfUsers.push(user);
    }
  }

  // the new group needs an array of user ids
  newGroup.members = membersForGroup;

  // actually create the MM group
  const createdGroup = await Groups.createGroup(newGroup);

  // now we have to add the group to the user's list and save
  for (let user of arrayOfUsers) {
    // if the user doesn't already have group relationship, add it
    if (user.groups.indexOf(createdGroup._id) < 0) {
      user.groups = [...user.groups, ...[createdGroup._id]];
      user.save();
    }
  }

  return createdGroup;
};
