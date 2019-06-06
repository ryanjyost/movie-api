const {
  PlatformServices,
  UserServices,
  GroupServices
} = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { to } = require("../../util");

module.exports = async token => {
  const GroupMeApi = GroupMeServices.createApi(token);

  //... get user's groupme data
  const groupMeUser = await to(GroupMeApi.getCurrentUser());

  //... find or create user with groupme data
  const user = await UserServices.findOrCreateUser(groupMeUser);

  let userMongoObject = null,
    userMMGroups = [],
    groupsForResponse = [];

  if (user.isNew) {
    userMongoObject = await UserServices.findUserById(user._id);

    userMMGroups = [...userMongoObject.groups];
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
  }

  if (user.isNew) {
    const finalNewUserData = await UserServices.findUserById(user._id);
    return { ...finalNewUserData.toObject(), ...{ isNew: true } };
  } else {
    return user;
  }
};
