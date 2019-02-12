const Movies = require("../../movies");
const Users = require("../../users");
const GroupMe = require("../../platforms/groupme");
const { to, moviePredictionCutoffDate } = require("../../helpers");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  // console.log(
  //   "cutoff",
  //   moment.unix(moviePredictionCutoffDate).format("MM/DD/YYYY hh:mm")
  // );
  let err, moviesToClose;

  [err, moviesToClose] = await to(
    Movies.getMovies({
      isClosed: 0,
      releaseDate: {
        $lte: moviePredictionCutoffDate
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
      [err, userInfo] = await to(Users.getUser({ _id: user }));
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

module.exports = handleMovieCutoffs;
