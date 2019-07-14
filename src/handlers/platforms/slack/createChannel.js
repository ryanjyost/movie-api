const { GroupServices, UserServices } = require("../../../services");
const { Slack } = require("../../../platforms");
const { WebClient } = require("@slack/web-api");
const Emitter = require("../../../EventEmitter");

module.exports = async userAccessToken => {
  const UserSlackApi = Slack.createApi(userAccessToken);
  const channel = await UserSlackApi.createChannel();
  // console.log("CHANNEL", channel);

  const botWeb = new WebClient(bot.bot_access_token);

  const currentUserInfo = await botWeb.users.info({ user: user_id });
  // console.log("USER", currentUserInfo);
  const newMMUser = await UserServices.findOrCreateSlackUser(
    currentUserInfo.user
  );
  // console.log("NEW USER", newMMUser);

  let newSlackGroup = await GroupServices.createSlackGroup({
    ...channel.data.channel,
    ...{ bot, members: [newMMUser._id] }
  });

  newMMUser.groups = [newSlackGroup._id];
  newMMUser.save();

  Emitter.emit("createdSlackGroup", newSlackGroup);

  return { group: newSlackGroup, user: newMMUser };
};
