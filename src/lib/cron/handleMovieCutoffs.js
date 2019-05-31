const Movies = require("../../movies");
const Users = require("../../users");
const Groups = require("../../groups");
const GroupMe = require("../../platforms/groupme");
const {
  moviePredictionCutoffDate,
  isMoviePastPredictionDeadline,
  sortArrayByProperty
} = require("../../../helpers");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  try {
    const moviesToClose = await Movies.getMovies({
      isClosed: 0
    });
    console.log("CUTOFFS");
    console.log("NOW", moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a Z"));
    console.log(
      "Cutoff",
      moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a Z")
    );

    for (let movie of moviesToClose) {
      console.log("==============");
      console.log(movie.title);
      console.log(
        "Release Date",
        moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a Z")
      );
      console.log("PAST?", isMoviePastPredictionDeadline(movie.releaseDate));

      if (isMoviePastPredictionDeadline(movie.releaseDate)) {
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
    }
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = handleMovieCutoffs;
