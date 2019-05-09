const { to, moviePredictionCutoffDate } = require("../../helpers");
const GroupMe = require("../../platforms/groupme");
const Movies = require("../../movies");
const Groups = require("../../groups");
const moment = require("moment");

const handleDayBeforeCutoffNotifications = async () => {
  let err, movies;

  // console.log(
  //   "CUTOFF",
  //   moviePredictionCutoffDate,
  //   moment
  //     .unix(moviePredictionCutoffDate)
  //     .add(1, "day")
  //     .unix()
  // );
  //
  // console.log(
  //   "CUTOFF",
  //   moment.unix(moviePredictionCutoffDate).format("MM/DD/YYYY hh:mm A"),
  //   moment
  //     .unix(moviePredictionCutoffDate)
  //     .add(1, "day")
  //     .format("MM/DD/YYYY hh:mm A")
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

  let text = `️👇 Predictions for these movies close at midnight tonight ⏲`;

  for (let movie of movies) {
    if (
      moment
        .unix(movie.releaseDate)
        .isSame(moment.unix(moviePredictionCutoffDate), "day")
    ) {
      // console.log(
      //   "MOVIE CUTOFF",
      //   movie,
      //   moment.unix(movie.releaseDate).format("MM/DD/YYYY hh:mm A")
      // );
      text = text + "\n" + `${movie.title}`;
    }
  }

  let groups;
  [err, groups] = await to(Groups.getGroups());

  for (let group of groups) {
    await GroupMe.sendBotMessage(text, group.bot.bot_id);
  }
};

module.exports = handleDayBeforeCutoffNotifications;
