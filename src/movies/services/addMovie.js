const Movie = require("../model");
const { to, sanitizeTitle } = require("../../helpers");
const moment = require("moment");

/*
* Add a new movie to the DB
*/
const addMovie = async newMovieData => {
  let err, newMovie;

  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  newMovieData.releaseDate = moment
    .unix(newMovieData.releaseDate)
    .startOf("day")
    .unix();

  console.log(
    "NEW MOVIE DATE",
    moment
      .unix(newMovieData.releaseDate)
      .startOf("day")
      .format("MM/DD/YYYY hh:mm A")
  );
  [err, newMovie] = await to(Movie.create(newMovieData));

  return newMovie;
};

module.exports = addMovie;
