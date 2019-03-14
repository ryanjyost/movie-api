const { to, moviePredictionCutoffDate } = require("../../helpers");
const GroupMe = require("../../platforms/groupme");
const Movies = require("../../movies");
const Groups = require("../../groups");
const moment = require("moment");

const handleDayBeforeCutoffNotifications = async () => {
  let err, movies;

  [err, movies] = await to(
    Movies.getMovies({
      isClosed: 0,
      releaseDate: {
        $gt: moviePredictionCutoffDate,
        $lte: moment
          .unix(moviePredictionCutoffDate)
          .add(1, "day")
          .unix()
      }
    })
  );

  if (!movies.length) {
    return null;
  }

  let text = `️👇 Predictions for these movies close at midnight tonight ⏲`;

  for (let movie of movies) {
    text = text + "\n" + `${movie.title}`;
  }

  let groups;
  [err, groups] = await to(Groups.getGroups());

  for (let group of groups) {
    await GroupMe.sendBotMessage(text, group.bot.bot_id);
  }
};

module.exports = handleDayBeforeCutoffNotifications;
