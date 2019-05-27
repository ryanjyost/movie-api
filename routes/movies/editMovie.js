const { Movies, Lib, Users } = require("../../src");

module.exports = async (req, res) => {
  //... update movie, return before update so can compare for conditional actions below
  const movieBeforeUpdate = await Movies.editMovie(
    { _id: req.params.id },
    req.body,
    false
  );

  //... update map of movie keys
  await Lib.updateMovieScoreMap(req.params.id, Number(req.body.rtScore));

  // movie is getting a score
  if (movieBeforeUpdate.rtScore < 0 && Number(req.body.rtScore) >= 0) {
    //... get movie that's being updated
    const movie = await Movies.getMovie({ _id: req.params.id });

    // ...b/c the movie has an RT Score, calc user prediction metrics
    const metrics = await Lib.calcSingleMovieMetrics({
      ...movie.toObject(),
      ...{ rtScore: req.body.rtScore }
    });

    movie.metrics = metrics;

    //... add movie to season and update movie with the season it's been added to
    const season = await Lib.addMovieToSeason(movieBeforeUpdate);
    movie.season = season.id;
    movie.save();

    // ... send movie (and season if applicable) results to groups
    await Lib.sendMovieScoreResultsToAllGroups(movie, Number(req.body.rtScore));
  }

  // ...add movie to user vote map with -1 if no vote
  if (!movieBeforeUpdate.isClosed && Number(req.body.isClosed) > 0) {
    await Users.updateUserVoteMaps(movieBeforeUpdate);
  }

  //...return all movies to make updating admin easier
  const movies = await Movies.getMovies();

  res.json({ movies });
};
