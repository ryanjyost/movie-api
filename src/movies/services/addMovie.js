const Movie = require("../model");
const { to, sanitizeTitle } = require("../../../helpers");
const moment = require("moment-timezone");

/*
* Add a new movie to the DB
*/
const addMovie = async newMovieData => {
  let err, newMovie;

  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  newMovieData.releaseDate = moment
    .unix(newMovieData.releaseDate)
    .utc()
    .startOf("day")
    .unix();

  [err, newMovie] = await to(Movie.create(newMovieData));

  return newMovie;
};

module.exports = addMovie;
