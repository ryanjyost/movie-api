const { WebClient } = require("@slack/web-api");
const { MovieServices } = require("../../services");

module.exports = async group => {
  const client = new WebClient(group.bot.bot_access_token);
  console.log("EVENT", group);

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
            "You're ready to start predicting the Rotten Tomatoes Scores of upcoming movies. Invite folks to this channel and they'll be ready to play, too. "
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "🍿 Right meow, there are 10 upcoming movies for you to predict. Get started with this one that's close to locking in predictions!"
        }
      },
      {
        type: "divider"
      }
    ]
  });

  //.... get upcoming movies to show example of one to predict
  const upcomingMovies = await MovieServices.findUpcomingMovies();

  // ...as long as there's an upcoming movie to predict, send onboarding info
  if (upcomingMovies.length) {
    // await client.chat.postMessage({
    //   channel: group.slackId,
    //   text: `Right meow, there are ${
    //     upcomingMovies.length
    //   } upcoming movies for you to predict. Get started with this one that's close to locking in predictions!`
    // });
    //
    await client.chat.postMessage({
      channel: group.slackId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎥 *${upcomingMovies[0].title}*`
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
    //
    await client.chat.postMessage({
      channel: group.slackId,
      text: `${upcomingMovies[0].trailer}`
    });
    // await client.chat.postMessage({
    //   channel: group.slackId,
    //   text: `To predict within this slack channel, simply post a message with the structure "movie title = percentage%" So if you think ${
    //     upcomingMovies[0].title
    //   } is going to get a Rotten Tomatoes Score of 59%, simply send the message "${
    //     upcomingMovies[0].title
    //   } = 59%"`
    // });
  }
};
