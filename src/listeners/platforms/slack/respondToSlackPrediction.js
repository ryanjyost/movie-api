const { MovieServices } = require("../../../services");
const { WebClient } = require("@slack/web-api");

module.exports = async (user, group, movieId, prediction) => {
  const client = new WebClient(group.bot.bot_access_token);
  const movie = await MovieServices.findMovieById(movieId);

  if (!(movie && user && group && prediction)) {
    return await client.chat.postEphemeral({
      response_type: "ephemeral",
      user: user.slackId,
      channel: group.slackId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `☹️ Something went wrong...` +
              `<mailto:ryanjyost@gmail.com?subject=Movie Medium|Click to report the problem>`
          }
        }
      ]
    });
  }

  const userName = user.slack ? user.slack.real_name || user.name : user.name;

  await client.chat.postMessage({
    channel: group.slackId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🍿 *${userName}* predicted *${prediction}%* for *${
            movie.title
          }*`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Predict",
            emoji: true
          },
          value: `predict_movie_${movie._id}`
        }
      }
    ]
  });
};
