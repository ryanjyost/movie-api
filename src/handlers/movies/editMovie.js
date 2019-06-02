const {
  MovieServices,
  MovieScoreMapServices,
  SeasonServices,
  UserServices
} = require("../../services");
const { sortArrayByProperty } = require("../../util");
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
    const season = await SeasonServices.addMovieToSeason(movieBeforeUpdate);
    movie.season = season.id;
    movie.save();

    Emitter.emit("movieGotScore", {
      ...movie.toObject(),
      ...{ rtScore: updatedData.rtScore }
    });
  }

  // ...add movie to user vote map with -1 if no vote
  if (!movieBeforeUpdate.isClosed && Number(updatedData.isClosed) > 0) {
    await MovieServices.handleMovieClose(movieBeforeUpdate);

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
  return await MovieServices.findAllMovies();
};
