const Movie = require("../model");
const { to, sanitizeTitle } = require("../../helpers");

/*
* Add a new movie to the DB
*/
const addMovie = async newMovieData => {
  let err, newMovie;

  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  [err, newMovie] = await to(Movie.create(newMovieData));

  return newMovie;
};

module.exports = addMovie;
