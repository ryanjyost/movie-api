const { messageAllGroups } = require("../util");
const { GroupServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { WebClient } = require("@slack/web-api");

module.exports = async movie => {
  let messages = [`🎥 ${movie.title}`, `${movie.trailer}`];
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    if (group.platform === "groupme") {
      for (let message of messages) {
        await GroupMeServices.sendBotMessage(message, group.bot.bot_id);
      }
    } else if (group.platform === "slack") {
      const client = new WebClient(group.bot.bot_access_token);

      await client.chat.postMessage({
        channel: group.slackId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🎥 *<${movie.rtLink}|${movie.title}>*`
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Make your prediction",
                emoji: true
              },
              value: `predict_movie_${movie._id}`
            }
          }
        ]
      });

      await client.chat.postMessage({
        channel: group.slackId,
        text: `${movie.trailer}`
      });

      await client.chat.postMessage({
        channel: group.slackId,
        blocks: [
          {
            type: "divider"
          }
        ]
      });
    }
  }
};
