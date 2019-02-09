const Movie = require("../model");
const { to, sanitizeTitle } = require("../../helpers");

/*
* Edit movie
*/
const editMovie = async newMovieData => {
  let err, newMovie;

  newMovieData.title_lower = sanitizeTitle(newMovieData.title);
  [err, newMovie] = await to(Movie.create(newMovieData));

  return newMovie;
};

module.exports = editMovie;
