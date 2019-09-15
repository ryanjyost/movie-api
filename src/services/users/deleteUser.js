const { Users, Groups } = require("../../models");

module.exports = async userId => {
  const user = await Users.findUserById(userId, false);

  for (let groupId of user.groups) {
    await Groups.removeUserFromGroup(groupId, user._id);
  }

  await Users.removeUser(userId);

  return true;
};
