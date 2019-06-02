const { Movies } = require("../../models");
const { sanitizeTitle } = require("../../util");
const moment = require("moment-timezone");

module.exports = async newMovieData => {
  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  newMovieData.releaseDate = moment
    .unix(newMovieData.releaseDate)
    .utc()
    .startOf("day")
    .unix();

  return await Movies.addMovie(newMovieData);
};
