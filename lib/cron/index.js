const Movie = require("../../src/movies/model");
const User = require("../../models/user");
const { to } = require("../../helpers");
const moment = require("moment");
const GroupMe = require("../groupme/index");

const handleMovieCutoffs = async () => {
  let err, moviesToClose;

  [err, moviesToClose] = await to(
    Movie.find({
      isClosed: 0,
      releaseDate: {
        $lte: moment()
          .add(7, "days")
          .unix()
      }
    })
  );

  for (let movie of moviesToClose) {
    movie.isClosed = 1;
    await to(movie.save());

    let movieMessage = `🔒 "${movie.title}" predictions are locked in!`;

    let voteMessage = ``;
    for (let user in movie.votes) {
      let err, userInfo;
      [err, userInfo] = await to(User.findOne({ _id: user }));
      if (userInfo && userInfo.name !== "Movie Medium") {
        voteMessage =
          voteMessage +
          `${userInfo.nickname || userInfo.name}: ${movie.votes[user]}%` +
          "\n";
      }
    }

    await GroupMe.sendBotMessage(movieMessage + "\n" + voteMessage);
    // await GroupMe.sendBotMessage(voteMessage);
  }
};

const handleDayBeforeCutoffNotifications = async () => {
  let err, movies;

  [err, movies] = await to(
    Movie.find({
      isClosed: 0,
      releaseDate: {
        $lte: moment()
          .add(8, "days")
          .unix(),
        $gt: moment()
          .add(7, "days")
          .unix()
      }
    })
  );

  for (let movie of movies) {
    await GroupMe.sendBotMessage(
      `⏲️ Predictions for "${movie.title}" close in 24 hours!`
    );
  }
};

module.exports = {
  handleMovieCutoffs,
  handleDayBeforeCutoffNotifications
};
