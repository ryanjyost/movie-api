const Movie = require("../models/movies/model.js");

const calculateSingleMovieMetrics = require("./calcSingleMovieMetrics");

module.exports = async () => {
  const movies = await Movie.find();

  for (let movie of movies) {
    movie.metrics = await calculateSingleMovieMetrics(movie);
    await movie.save();
  }
};
