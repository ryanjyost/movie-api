const Movie = require("../model");
const { moviePredictionCutoffDate, to } = require("../../helpers");

const getMovies = async query => {
  let err, movies;

  [err, movies] = await to(Movie.find(query));

  return movies;
};

module.exports = getMovies;
