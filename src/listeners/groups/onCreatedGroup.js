const { GroupMe } = require("../../platforms");
const { MovieServices } = require("../../services");

module.exports = async botId => {
  //...send welcome message
  await GroupMe.sendBotMessage(
    `You're ready to start predicting Rotten Tomatoes Scores 🎉 Invite more friends to this chat and they'll be ready to play, too.` +
      "\n" +
      "\n" +
      `Learn how to play and manage predictions at moviemedium.io`,
    botId
  );

  //.... get upcoming movies to show example of one to predict
  const upcomingMovies = await MovieServices.findUpcomingMovies();

  // ...as long as there's an upcoming movie to predict, send onboarding info
  if (upcomingMovies.length) {
    await GroupMe.sendBotMessage(
      `There are ${
        upcomingMovies.length
      } upcoming movies for you to predict. Get started with this one that's close to locking in predictions!`,
      botId
    );

    await GroupMe.sendBotMessage(`🍿 ${upcomingMovies[0].title}`, botId);

    await GroupMe.sendBotMessage(`${upcomingMovies[0].trailer}`, botId);

    await GroupMe.sendBotMessage(
      `To predict within this GroupMe chat, simply post a message with the structure "movie title = percentage%" So if you think ${
        upcomingMovies[0].title
      } is going to get a Rotten Tomatoes Score of 59%, simply send the message "${
        upcomingMovies[0].title
      } = 59%"`,
      botId
    );
  }
};
