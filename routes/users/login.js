const { Users, GroupMe, Groups } = require("../../src");

module.exports = async (req, res) => {
  let token = req.body.access_token;
  const GroupMeApi = GroupMe.createApi(token);

  //... get user's groupme data
  const groupMeUser = await GroupMeApi.getCurrentUser();
  console.log("CURRENT", groupMeUser);

  //... find or create user with groupme data
  const user = await Users.findOrCreateUser(groupMeUser.data.response);

  let userMongoObject;

  if (user.isNew) {
    userMongoObject = await Users.findOrCreateUser(
      groupMeUser.data.response,
      null,
      true
    );

    let userMMGroups = [...userMongoObject.groups];
    //... get user's groups
    const usersGroups = await GroupMeApi.getCurrentUsersGroups();

    for (let group of usersGroups.data.response) {
      const existingGroup = await Groups.getGroup({
        groupmeId: group.group_id
      });

      if (existingGroup) {
        await Groups.addUserToGroup(userMongoObject._id, {
          groupmeId: group.group_id
        });
        userMMGroups.push(existingGroup._id);
      }
    }

    userMongoObject.groups = userMMGroups;
    userMongoObject.save();
  }

  const existingUser = await Users.getUser(
    { _id: user ? user._id : userMongoObject._id },
    {},
    { path: "groups", populate: { path: "members" } }
  );

  res.json({
    user: existingUser,
    token: user ? (user.isNew ? token : null) : null
  });
};
