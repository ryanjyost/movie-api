const { WebClient } = require("@slack/web-api");
const { GroupServices } = require("../../../services");

module.exports = async body => {
  const groups = await GroupServices.findGroupBySlackTeamId(body.team_id);
  const client = new WebClient(groups[0].bot.bot_access_token);

  await client.chat.postMessage({
    user: body.event.user,
    channel: body.event.channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hi! Hope you enjoy predicting Rotten Tomatoes Scores with Movie Medium. \n `
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `In addition to the #moviemedium channel, don't forget that you can use moviemedium.io to play the game, too!`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `If you ever have questions, comments or suggestions, feel free to send a message to Movie Medium in this direct channel, or email Ryan (maker of this thing) at ryanjyost@gmail.com.`
        }
      }
    ]
  });
};
