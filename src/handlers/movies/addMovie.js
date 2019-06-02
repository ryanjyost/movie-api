const { MovieServices, MovieScoreMapServices } = require("../../services");
const Emitter = require("../../EventEmitter");

module.exports = async newMovieData => {
  //... add new movie to the db
  const newMovie = await MovieServices.addMovie(newMovieData);

  //...record that we have a new movie without a RT score yet
  await MovieScoreMapServices.updateMovieScoreMap(newMovie.id, -1);

  //...let groups know that a movie was added
  if (newMovie) {
    Emitter.emit("addedMovie", newMovie.toObject());
  }

  // ...return all movies to make updating admin easier
  const movies = await MovieServices.findAllMovies();

  return { newMovie, movies };
};
