const {
  moviePredictionCutoffDate,
  isMoviePastPredictionDeadline
} = require("../../../helpers");
const GroupMe = require("../../platforms/groupme");
const Movies = require("../../movies");
const Groups = require("../../groups");
const moment = require("moment");

const handleDayBeforeCutoffNotifications = async () => {
  try {
    const movies = await Movies.getMovies({
      isClosed: 0,
      rtScore: -1
    });

    if (!movies.length) {
      return null;
    }

    let text = `️⏳ Predictions for these movies close in just a few days!`;
    let atleastOneMovie = false;

    for (let movie of movies) {
      if (
        moment
          .unix(movie.releaseDate)
          .utc()
          .diff(moment.unix(moviePredictionCutoffDate), "day") === 4 &&
        !isMoviePastPredictionDeadline(movie.releaseDate)
      ) {
        atleastOneMovie = true;
        text = text + "\n" + `${movie.title}`;
      }
    }

    if (!atleastOneMovie) return null;

    const groups = await Groups.getGroups();

    for (let group of groups) {
      await GroupMe.sendBotMessage(text, group.bot.bot_id);
    }
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = handleDayBeforeCutoffNotifications;
