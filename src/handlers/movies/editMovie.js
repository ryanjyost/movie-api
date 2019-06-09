const {
  MovieServices,
  MovieScoreMapServices,
  SeasonServices
} = require("../../services");
const Boom = require("@hapi/boom");
const Emitter = require("../../EventEmitter");

module.exports = async (movieId, updatedData) => {
  //... update movie, return before update so can compare for conditional actions below
  const movieBeforeUpdate = await MovieServices.editMovie(
    movieId,
    updatedData,
    false
  );

  //... update map of movie keys
  await MovieScoreMapServices.update(movieId, Number(updatedData.rtScore));

  //... get movie that's being updated
  const movie = await MovieServices.findMovieById(movieId);

  // movie is getting a score
  if (movieBeforeUpdate.rtScore < 0 && Number(updatedData.rtScore) >= 0) {
    // ...b/c the movie has an RT Score, calc user prediction metrics
    const metrics = await MovieServices.calcSingleMovieMetrics({
      ...movie.toObject(),
      ...{ rtScore: updatedData.rtScore }
    });

    if (!metrics) throw Boom.badImplementation("Failed to calc movie metrics");
    movie.metrics = metrics;

    //... add movie to season and update movie with the season it's been added to
    const season = await SeasonServices.addMovieToSeason({
      ...movie.toObject(),
      ...{ rtScore: updatedData.rtScore }
    });
    movie.season = season.id;
    await movie.save();

    Emitter.emit(
      "movieGotScore",
      {
        ...movie.toObject(),
        ...{ rtScore: updatedData.rtScore }
      },
      season.toObject()
    );
  }

  // ...add movie to user vote map with -1 if no vote
  if (!movieBeforeUpdate.isClosed && Number(updatedData.isClosed) > 0) {
    await MovieServices.handleMovieClose(movieBeforeUpdate);
  }

  //...return all movies to make updating admin easier
  return await MovieServices.findAllMovies();
};
