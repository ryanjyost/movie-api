const {
  MovieServices,
  GroupServices,
  PlatformServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;

const { moviePredictionCutoffDate } = require("../util");
const moment = require("moment");
const Boom = require("@hapi/boom");

module.exports = async daysBeforeCutoff => {
  try {
    const movies = await MovieServices.findUpcomingMovies();

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
          .diff(moment.unix(moviePredictionCutoffDate), "day") === 4
      ) {
        atleastOneMovie = true;
        text = text + "\n" + `${movie.title}`;
      }
    }

    if (!atleastOneMovie) return null;

    const groups = await GroupServices.findAllGroups();

    for (let group of groups) {
      await GroupMeServices.sendBotMessage(text, group.bot.bot_id);
    }
  } catch (e) {
    throw Boom.badImplementation("Cutoff notifications failed");
  }
};
