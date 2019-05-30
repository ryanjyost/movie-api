const Movie = require("../model");
const { to, sanitizeTitle } = require("../../../util/index");
const moment = require("moment-timezone");

module.exports = async newMovieData => {
  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  newMovieData.releaseDate = moment
    .unix(newMovieData.releaseDate)
    .utc()
    .startOf("day")
    .unix();

  return await Movie.create(newMovieData);
};
