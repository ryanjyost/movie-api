const { WebClient } = require("@slack/web-api");
const { MovieServices } = require("../../services");
const sendUpcomingMovieInfo = require("../platforms/slack/sendUpcomingMovieInfo");

module.exports = async group => {
  const client = new WebClient(group.bot.bot_access_token);

  await client.chat.postMessage({
    channel: group.slackId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Welcome to Movie Medium, the game where you *predict Rotten Tomatoes Scores of upcoming movies against your coworkers.*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Invite coworkers to this channel to get them in on the action."
        }
      },
      {
        type: "divider"
      }
    ]
  });

  await sendUpcomingMovieInfo(group);
};
