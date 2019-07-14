const User = require("./model");
const Groups = require("../groups");

/*
* Find or create a MM user based on GroupMe info
*/

module.exports = async (userData, groupId) => {
  let isNew = false;

  let user = await User.findOne({
    slackId: userData.id
  }).populate({
    path: "groups",
    populate: { path: "members" }
  });

  if (!user) {
    isNew = true;
    user = await User.create({
      platform: "slack",
      slack: userData,
      slackId: userData.id,
      name: userData.display_name,
      nickname:
        userData.profile.display_name ||
        userData.profile.real_name ||
        userData.real_name ||
        user.name,
      votes: { placeholder: 1 },
      groups: groupId ? [groupId] : []
    });

    await Groups.addUserToGroup({ _id: groupId }, user._id);
  }

  return user;
};
