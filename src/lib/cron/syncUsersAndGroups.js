const { to } = require("../../helpers/index");
const Users = require("../../users");
const Groups = require("../../groups");
const GroupMe = require("../../platforms/groupme");

module.exports = async () => {
  let err, groups;
  [err, groups] = await to(Groups.getGroups());

  for (let group of groups) {
    let updatedGroupMemberIds = [];
    // console.log("GROUP", group);

    let err, groupMeData;
    [err, groupMeData] = await to(GroupMe.getGroup(group.groupmeId));
    // console.log("DATA", groupMeData);

    for (let member of groupMeData.members) {
      let user;
      [err, user] = await to(Users.getUser({ groupmeId: member.user_id }));

      if (user) {
        user.groups =
          "groups" in user && user.groups
            ? [...user.groups, ...[group._id]]
            : [group._id];
        user.save();
        updatedGroupMemberIds.push(user._id);
      } else {
        let err, newUser;
        [err, newUser] = await to(Users.findOrCreateUser(member, group._id));

        // console.log("CREATED", newUser);
        updatedGroupMemberIds.push(newUser._id);
      }
    }

    // console.log("UPDATED MEMBERS", updatedGroupMemberIds);

    group.members = updatedGroupMemberIds;
    group.save();
  }
};
