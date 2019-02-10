const { to } = require("../../helpers");
const Group = require("../model.js");

/*
* Create an MM group from GroupMe group
*/
const create = async groupMeId => {
  // 46925214
  // stuff we need
  const GroupMe = require("../../lib/groupme/index.js");
  const UserController = require("../../../controllers/UserController.js");
  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);

  //..... get group info from GroupMe
  let err, groupmeGroup;
  [err, groupmeGroup] = await to(GroupMeApi.get(`groups/${groupMeId}`));

  // if the groupme group was found
  if (groupmeGroup) {
    // start building new group
    let newGroup = {
      name: groupmeGroup.data.response.name,
      groupmeId: groupmeGroup.data.response.group_id,
      groupme: { ...groupmeGroup.data.response }
    };

    //...loop through GroupMe members and find or create MM users
    let membersForGroup = [];
    const members = groupmeGroup.data.response.members;
    for (let member of members) {
      let err, user;
      [err, user] = await to(
        UserController._findOrCreateUser(
          member,
          groupmeGroup.data.response.group_id
        )
      );

      // add user ids to new group
      if (user) {
        membersForGroup.push(user._id);
      }
    }

    newGroup.members = membersForGroup;

    // actually create the MM group
    let createdGroup;
    [err, createdGroup] = await to(Group.create(newGroup));
    return createdGroup;
  } else {
    // GroupMe didn't send back a group, so nothing
    return null;
  }
};

module.exports = create;
