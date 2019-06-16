const {
  MovieServices,
  UserServices,
  GroupServices,
  PlatformServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;

const {
  isMoviePastPredictionDeadline,
  sortArrayByProperty
} = require("../util/index");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  try {
    const moviesToClose = await MovieServices.findUpcomingMovies();

    for (let movie of moviesToClose) {
      if (isMoviePastPredictionDeadline(movie.releaseDate)) {
        movie.isClosed = 1;
        await movie.save();

        await UserServices.updateUserVoteMaps(movie._id);

        const groups = await GroupServices.findAllGroups();

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

          await GroupMeServices.sendBotMessage(
            movieMessage + "\n" + voteMessage,
            group.bot.bot_id
          );
        }
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = handleMovieCutoffs;
