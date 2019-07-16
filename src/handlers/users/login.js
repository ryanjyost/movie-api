const {
  PlatformServices,
  UserServices,
  GroupServices
} = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { to } = require("../../util");
const createGroup = require("../groups/createGroup");

module.exports = async token => {
  const GroupMeApi = GroupMeServices.createApi(token);

  //... get user's groupme data
  const groupMeUser = await to(GroupMeApi.getCurrentUser());

  //... find or create user with groupme data
  let user = await UserServices.findOrCreateUser(groupMeUser);

  let madeNewGroup = false;
  if (user.isNew) {
    let groupsForResponse = [];
    let userMongoObject = await UserServices.findUserById(user._id);

    let userMMGroups = [...userMongoObject.groups];
    //... get user's groups
    const usersGroups = await to(GroupMeApi.getCurrentUsersGroups());

    for (let group of usersGroups) {
      const existingGroup = await GroupServices.findGroupByGroupMeId(
        group.group_id
      );

      if (existingGroup) {
        await GroupServices.addUserToGroup(
          {
            groupmeId: group.group_id
          },
          userMongoObject._id
        );
        userMMGroups.push(existingGroup._id);
        groupsForResponse.push(existingGroup);
      }
    }

    userMongoObject.groups = userMMGroups;
    await userMongoObject.save();

    // if user isn't part of an existing group, create a new one
    if (!userMMGroups.length) {
      await createGroup(token);
      madeNewGroup = true;
    }
  }

  if (user.isNew) {
    const finalNewUserData = await UserServices.findUserById(user._id);
    return { ...finalNewUserData.toObject(), ...{ isNew: true, madeNewGroup } };
  } else {
    return user;
  }
};
