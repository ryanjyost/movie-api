const { WebClient } = require("@slack/web-api");

module.exports = async (channelId, userId, bot, movie, prediction) => {
  const client = new WebClient(bot.bot_access_token);

  await client.chat.postEphemeral({
    response_type: "ephemeral",
    user: userId,
    channel: channelId,
    text: `Your prediction for ${movie.title} of ${prediction}% was saved 👍`,
    attachments: []
  });
};
