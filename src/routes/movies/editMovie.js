const { Movies, Lib, Users, Groups, GroupMe } = require("../../index");
const { sortArrayByProperty } = require("../../util/index");

module.exports = async (req, res) => {
  //... update movie, return before update so can compare for conditional actions below
  const movieBeforeUpdate = await Movies.editMovie(
    { _id: req.params.id },
    req.body,
    false
  );

  //... update map of movie keys
  await Lib.updateMovieScoreMap(req.params.id, Number(req.body.rtScore));

  //... get movie that's being updated
  const movie = await Movies.getMovie({ _id: req.params.id });

  // movie is getting a score
  if (movieBeforeUpdate.rtScore < 0 && Number(req.body.rtScore) >= 0) {
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

    const groups = await Groups.getGroups({}, "members");

    for (let group of groups) {
      let movieMessage =
        `🔒 "${movie.title}" predictions are locked in!` + "\n";

      let sortedMembers = sortArrayByProperty(
        group.members,
        `votes.${movie._id}`,
        false
      );

      let voteMessage = ``;
      for (let user of sortedMembers) {
        if (user && user.name !== "Movie Medium") {
          voteMessage =
            voteMessage +
            `${user.name}: ${
              user.votes[movie._id] < 0
                ? `Forgot to predict 😬`
                : `${user.votes[movie._id]}%`
            }` +
            "\n";
        }
      }

      await GroupMe.sendBotMessage(
        movieMessage + "\n" + voteMessage,
        group.bot.bot_id
      );
    }
  }

  //...return all movies to make updating admin easier
  const movies = await Movies.getMovies();

  res.json({ movies });
};
