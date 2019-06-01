const User = require("./model");

/*
* Find or create a MM user based on GroupMe info
*/

module.exports = async (
  groupmeMemberData,
  groupId,
  returnMongoObject = false
) => {
  let isNew = false;

  let user = await User.findOne({ groupmeId: groupmeMemberData.user_id });

  if (!user) {
    isNew = true;
    user = await User.create({
      groupme: groupmeMemberData,
      groupmeId: groupmeMemberData.user_id,
      name: groupmeMemberData.name,
      nickname: groupmeMemberData.nickname || groupmeMemberData.name,
      votes: { placeholder: 1 },
      groups: groupId ? [groupId] : []
    });
  }

  if (returnMongoObject) {
    return user;
  }
  return { ...user.toObject(), ...{ isNew } };
};
