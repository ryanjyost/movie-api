const {
  GroupServices,
  PlatformServices,
  UserServices
} = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { moviePredictionCutoffDate, to } = require("../../util/index");
const Emitter = require("../../EventEmitter");

module.exports = async accessToken => {
  //... create GroupMe group
  const newGroup = await to(GroupMeServices.createGroup());

  //... get user who's creating the group
  const UserGroupMeApi = GroupMeServices.createApi(accessToken);
  const currentUser = await to(UserGroupMeApi.getCurrentUser());

  //... add user who created the MM group to the GroupMe group
  await GroupMeServices.addMemberToGroup(newGroup.id, {
    members: [
      {
        user_id: currentUser.id,
        nickname: currentUser.nickname || currentUser.name
      }
    ]
  });

  // add user to GroupMe group who's creating the group
  newGroup.members.push(currentUser);

  //... create bot for the new group
  const newBot = await to(GroupMeServices.createBot(newGroup.id));

  //... create MM group
  const createdGroup = await GroupServices.createGroup({
    ...newGroup,
    ...{ bot: newBot.bot }
  });

  // ...send updated user info for inital entry into the app
  const user = await UserServices.findUserByGroupMeId(currentUser.user_id);
  user.groups = [...user.groups, ...[createdGroup]];

  Emitter.emit("createdGroup", newBot.bot.bot_id);

  return { createdGroup, user };
};
