const { Movies, Lib, Users } = require("../../src");

module.exports = async (req, res) => {
  const movieBeforeUpdate = await Movies.editMovie(
    { _id: req.params.id },
    req.body,
    false
  );

  await Lib.updateMovieScoreMap(req.params.id, Number(req.body.rtScore));

  const movie = await Movies.getMovie({ _id: req.params.id });

  // movie is getting a score
  if (movieBeforeUpdate.rtScore < 0 && Number(req.body.rtScore) >= 0) {
    const metrics = await Lib.calcSingleMovieMetrics({
      ...movie.toObject(),
      ...{ rtScore: req.body.rtScore }
    });

    movie.metrics = metrics;

    const season = await Lib.addMovieToSeason(movieBeforeUpdate);
    movie.season = season.id;

    await Lib.sendMovieScoreResultsToAllGroups(movie, Number(req.body.rtScore));
    movie.save();
  }

  // add movie to user vote map with -1 if no vote
  if (!movieBeforeUpdate.isClosed && Number(req.body.isClosed) > 0) {
    await Users.updateUserVoteMaps(movieBeforeUpdate);
  }

  // return all movies to make updating admin easier
  const movies = await Movies.getMovies();

  res.json({ movies });
};
