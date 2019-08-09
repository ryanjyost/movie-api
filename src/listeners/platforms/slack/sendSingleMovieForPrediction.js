const { WebClient } = require("@slack/web-api");
const { singleMovieSlackMessage } = require("./util");

module.exports = async (group, userId, movie) => {
  const client = new WebClient(group.bot.bot_access_token);

  await client.chat.postEphemeral({
    response_type: "ephemeral",
    user: userId,
    channel: group.slackId,
    blocks: [singleMovieSlackMessage(movie)]
  });
};
