const { WebClient } = require("@slack/web-api");
const { MovieServices } = require("../../../services");
const { singleMovieSlackMessage, slackHotTips } = require("./util");

module.exports = async (group, user) => {
  const client = new WebClient(group.bot.bot_access_token);
  //.... get upcoming movies to show example of one to predict
  const upcomingMovies = await MovieServices.findUpcomingMovies();

  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*To get you started*, there are *${
            upcomingMovies.length
          } upcoming movies* for you to predict.` +
          "\n" +
          ``
      }
    }
  ];

  for (let i = 0; i < upcomingMovies.length && i < 3; i++) {
    // blocks.push(singleMovieSlackMessage(upcomingMovies[i]));
    blocks = [...blocks, ...singleMovieSlackMessage(upcomingMovies[i])];
  }

  if (upcomingMovies.length > 3) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<https://moviemedium.io/upcoming|Predict all upcoming movies at moviemedium.io>`
      }
    });
  }

  // ...as long as there's an upcoming movie to predict, send onboarding info
  if (upcomingMovies.length) {
    await client.chat[user ? "postEphemeral" : "postMessage"]({
      response_type: user ? "ephemeral" : "in_channel",
      user: user ? user.id : null,
      channel: group.slackId,
      blocks: [
        ...blocks,
        {
          type: "divider"
        },
        slackHotTips
      ]
    });
  }
};
