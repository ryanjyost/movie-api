const { Movies } = require("../services");
const calculateSingleMovieMetrics = require("../services/movies/calcSingleMovieMetrics");

module.exports = async () => {
  const movies = await Movies.findAllMovies();

  for (let movie of movies) {
    movie.metrics = await calculateSingleMovieMetrics(movie);
    await movie.save();
  }
};
