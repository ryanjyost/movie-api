const Movies = require("../../movies");
const Users = require("../../users");
const Groups = require("../../groups");
const GroupMe = require("../../platforms/groupme");
const {
  to,
  moviePredictionCutoffDate,
  sortArrayByProperty
} = require("../../helpers");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  try {
    console.log(
      "cutoff",
      moment.unix(moviePredictionCutoffDate).format("MM/DD/YYYY hh:mm")
    );

    let err, moviesToClose;
    [err, moviesToClose] = await to(
      Movies.getMovies({
        isClosed: 0,
        releaseDate: {
          $lte: moviePredictionCutoffDate
        }
      })
    );

    for (let movie of moviesToClose) {
      movie.isClosed = 1;
      await to(movie.save());

      let err, response;
      [err, response] = await to(Users.updateUserVoteMaps(movie));
      if (err) throw new Error(err);

      let groups;
      [err, groups] = await to(Groups.getGroups({}, "members"));
      if (err) throw new Error(err);

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

      // await GroupMe.sendBotMessage(voteMessage);
    }
  } catch (e) {
    console.log("CUTOFF ERROR", e);
  }
};

module.exports = handleMovieCutoffs;
