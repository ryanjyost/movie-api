const { WebClient } = require("@slack/web-api");
const { MovieServices } = require("../../../services");

module.exports = async (group, user) => {
  const client = new WebClient(group.bot.bot_access_token);
  //.... get upcoming movies to show example of one to predict
  const upcomingMovies = await MovieServices.findUpcomingMovies();

  // ...as long as there's an upcoming movie to predict, send onboarding info
  if (upcomingMovies.length) {
    await client.chat[user ? "postEphemeral" : "postMessage"]({
      response_type: user ? "ephemeral" : "in_channel",
      user: user ? user.id : null,
      channel: group.slackId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🍿 Right meow, there are ${
              upcomingMovies.length
            } upcoming movies for you to predict. Get started with this one that's close to locking in predictions! And *be sure to visit moviemedium.io to catch up on all upcoming movies!*`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎥 *<${upcomingMovies[0].rtLink}|${
              upcomingMovies[0].title
            }>*`
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Make your prediction",
              emoji: true
            },
            value: `predict_movie_${upcomingMovies[0]._id}`
          }
        }
      ]
    });
    // separate
    await client.chat[user ? "postEphemeral" : "postMessage"]({
      response_type: user ? "ephemeral" : "in_channel",
      user: user ? user.id : null,
      channel: group.slackId,
      text: `${upcomingMovies[0].trailer}`
    });
  }
};
