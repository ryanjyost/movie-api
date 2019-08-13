const { WebClient } = require("@slack/web-api");
const { MovieServices, UserServices } = require("../../../services");
const { singleMovieSlackMessage, slackHotTips } = require("./util");

module.exports = async (group, userId) => {
  const client = new WebClient(group.bot.bot_access_token);
  const user = await UserServices.findUserBySlackId(userId);
  //.... get upcoming movies to show example of one to predict

  const allUpcomingMovies = await MovieServices.findUpcomingMovies();
  let moviesToSend = [],
    hasPredictedAllMovies = false;
  if (!user) {
    moviesToSend = allUpcomingMovies;
  } else {
    moviesToSend = allUpcomingMovies.filter(movie => {
      return !(movie._id in user.votes);
    });

    if (!moviesToSend.length) {
      moviesToSend = allUpcomingMovies;
      hasPredictedAllMovies = true;
    }
  }

  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `There are *${moviesToSend.length} upcoming movies* ${
            hasPredictedAllMovies
              ? "for you to predict."
              : `you haven't predicted yet.`
          }` +
          "\n" +
          ``
      }
    }
  ];

  for (let i = 0; i < moviesToSend.length && i < 3; i++) {
    // blocks.push(singleMovieSlackMessage(moviesToSend[i]));
    blocks = [...blocks, ...singleMovieSlackMessage(moviesToSend[i])];
  }

  if (moviesToSend.length > 3) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<https://moviemedium.io/upcoming|See and predict all upcoming movies at moviemedium.io>`
      }
    });
  }

  // ...as long as there's an upcoming movie to predict, send onboarding info
  if (moviesToSend.length) {
    await client.chat.postEphemeral({
      response_type: "ephemeral",
      user: userId,
      channel: group.slackId,
      blocks: [...blocks]
    });
  }
};
