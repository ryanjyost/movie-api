const {
  to,
  moviePredictionCutoffDate,
  isMoviePastPredictionDeadline
} = require("../../helpers");
const GroupMe = require("../../platforms/groupme");
const Movies = require("../../movies");
const Groups = require("../../groups");
const moment = require("moment");

const handleDayBeforeCutoffNotifications = async () => {
  let err, movies;
  //
  // console.log(
  //   "CURRENT",
  //   moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a Z")
  // );
  // console.log(
  //   "CUTOFF",
  //   moment
  //     .unix(moviePredictionCutoffDate)
  //     .utc()
  //     .format("dddd, MMMM Do YYYY, h:mm:ss a Z")
  // );

  [err, movies] = await to(
    Movies.getMovies({
      isClosed: 0,
      rtScore: -1
    })
  );

  if (!movies.length) {
    return null;
  }

  let text = `️⏳ Predictions for these movies close soon!`;
  let atleastOneMovie = false;

  for (let movie of movies) {
    // console.log(`====== ${movie.title}======`);
    // console.log(
    //   "Release",
    //   moment
    //     .unix(movie.releaseDate)
    //     .utc()
    //     .format("dddd, MMMM Do YYYY, h:mm:ss a Z")
    // );
    // console.log("PASSED?", isMoviePastPredictionDeadline(movie.releaseDate));
    // console.log(
    //   "DIFF DAYS",
    //   moment
    //     .unix(movie.releaseDate)
    //     .utc()
    //     .diff(moment.unix(moviePredictionCutoffDate), "day")
    // );
    if (
      moment
        .unix(movie.releaseDate)
        .utc()
        .diff(moment.unix(moviePredictionCutoffDate), "day") < 1 &&
      !isMoviePastPredictionDeadline(movie.releaseDate)
    ) {
      console.log("MOVIE Warning", movie.title);
      atleastOneMovie = true;
      text = text + "\n" + `${movie.title}`;
    }
  }

  if (!atleastOneMovie) return null;

  let groups;
  [err, groups] = await to(Groups.getGroups());

  for (let group of groups) {
    await GroupMe.sendBotMessage(text, group.bot.bot_id);
  }
};

module.exports = handleDayBeforeCutoffNotifications;
