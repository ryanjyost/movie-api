const Movie = require("../movies/model.js");
const MovieScoreMap = require("../../models/movieScoreMap.js");
const { to } = require("../helpers/index");
const calculateSingleMovieMetrics = require("./calcSingleMovieMetrics");

module.exports = async () => {
  let err, movies;
  [err, movies] = await to(Movie.find());

  for (let movie of movies) {
    movie.metrics = calculateSingleMovieMetrics(movie);
    movie.save();
  }
};
