const Movies = require("../../models/movies");
const Users = require("../../models/users");
const Groups = require("../../models/groups");
const GroupMe = require("../../platforms/groupme");
const {
  moviePredictionCutoffDate,
  sortArrayByProperty
} = require("../../util");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  try {
    const moviesToClose = await Movies.getMovies({
      isClosed: 0
    });

    for (let movie of moviesToClose) {
      if (
        moment
          .unix(movie.releaseDate)
          .isAfter(moment.unix(moviePredictionCutoffDate).utc())
      ) {
        continue;
      }
      movie.isClosed = 1;
      await movie.save();

      await Users.updateUserVoteMaps(movie);

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
              `${user.nickname || user.name}: ${
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
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = handleMovieCutoffs;
