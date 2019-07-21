const { WebClient } = require("@slack/web-api");

module.exports = async (user, group) => {
  const client = new WebClient(group.bot.bot_access_token);

  await client.chat.postEphemeral({
    response_type: "ephemeral",
    user: user.slackId,
    channel: group.slackId,
    text: `😬 Your prediction must be a number between 0 and 100. _That can include 0 and 100_`
  });
};
