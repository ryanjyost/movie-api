const { WebClient } = require("@slack/web-api");
const { GroupServices } = require("../../services");

module.exports = async (event, token) => {
  const groups = await GroupServices.findGroupBySlackTeamId(event.team);
  const client = new WebClient(groups[0].bot.bot_access_token);
  await client.reactions.add({
    name: "thumbsup",
    channel: event.channel,
    timestamp: event.event_ts
  });
};
