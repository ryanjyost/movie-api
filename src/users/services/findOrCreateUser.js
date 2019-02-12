const User = require("../model");
const { to } = require("../../helpers");

/*
* Find or create a MM user based on GroupMe info
*/

const findOrCreateUser = async (groupmeMemberData, groupId) => {
  let isNew = false;

  let err, user;
  [err, user] = await to(
    User.findOne({ groupmeId: groupmeMemberData.user_id })
  );

  if (!user) {
    isNew = true;
    [err, user] = await to(
      User.create({
        groupme: groupmeMemberData,
        groupmeId: groupmeMemberData.user_id,
        name: groupmeMemberData.name,
        nickname: groupmeMemberData.nickname || groupmeMemberData.name,
        votes: { placeholder: 1 },
        groups: [groupId]
      })
    );
  }

  return { ...user.toObject(), ...{ isNew } };
};

module.exports = findOrCreateUser;
