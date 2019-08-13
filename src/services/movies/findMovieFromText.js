const { sanitizeTitle } = require("../../util");
const { MovieServices } = require("../../services");

module.exports = async text => {
  const split = text.includes("=") ? text.split("=") : text.split("-");
  let title = split[0].trim();
  let cleanTitle = sanitizeTitle(title);

  // look for exact match
  let movie = await MovieServices.findMovieByCleanTitle(cleanTitle);

  if (!movie) {
    movie = await MovieServices.fuzzySearchMovies(cleanTitle);

    if (!movie) return null;
  }

  if (movie.isClosed) {
    // await GroupMe.sendBotMessage(
    //   `"${movie.title}" is passed the prediction deadline ☹️`,
    //   group.bot.bot_id
    // );
    return null;
  }

  return movie;
};
