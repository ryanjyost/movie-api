const { GroupServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { WebClient } = require("@slack/web-api");

module.exports = async messages => {
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    if (group.platform === "groupme") {
      for (let message of messages) {
        await GroupMeServices.sendBotMessage(message, group.bot.bot_id);
      }
    } else if (group.platform === "slack") {
      const client = new WebClient(group.bot.bot_access_token);
      for (let message of messages) {
        await client.chat.postMessage({
          channel: group.slackId,
          text: message
        });
      }
    }
  }

  return true;
};
