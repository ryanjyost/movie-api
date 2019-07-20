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
          text: "*👋 Welcome to Movie Medium!*"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "You're ready to start predicting the Rotten Tomatoes Scores of upcoming movies."
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "Invite coworkers to this channel and they'll be ready to play, too."
        }
      },
      {
        type: "divider"
      }
    ]
  });

  await sendUpcomingMovieInfo(group);
};
