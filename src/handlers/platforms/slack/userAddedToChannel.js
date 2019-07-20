const { WebClient } = require("@slack/web-api");
const Emitter = require("../../../EventEmitter");
const { UserServices, GroupServices } = require("../../../services");

module.exports = async (userId, channelId, botAccessToken) => {
  try {
    const client = new WebClient(botAccessToken);
    const userResponse = await client.users.info({ user: userId });

    const existingUser = await UserServices.findUserBySlackId(userId);
    const existingGroup = await GroupServices.findGroupBySlackId(channelId);

    if (!existingUser && existingGroup) {
      Emitter.emit("userAddedToSlackChannel", userResponse.user, existingGroup);
    }
  } catch (e) {
    console.log(e);
  }
};
