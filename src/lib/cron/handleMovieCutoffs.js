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
      moment
        .unix(moviePredictionCutoffDate)
        .utc()
        .format("dddd, MMMM Do YYYY, h:mm:ss a Z")
    );
    console.log("now", moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a Z"));

    let err, moviesToClose;
    [err, moviesToClose] = await to(
      Movies.getMovies({
        isClosed: 0
      })
    );

    for (let movie of moviesToClose) {
      if (
        moment
          .unix(movie.releaseDate)
          .isAfter(moment.unix(moviePredictionCutoffDate).utc())
      ) {
        continue;
      }
      console.log("Closing...", movie.title);
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
