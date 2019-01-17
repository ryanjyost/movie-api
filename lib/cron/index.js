const Movie = require("../../models/movie");
const User = require("../../models/user");
const to = require("../to");
const moment = require("moment");
const GroupMe = require("../GroupMe");

const handleMovieCutoffs = async () => {
  let err, moviesToClose;

  [err, moviesToClose] = await to(
    Movie.find({
      isClosed: 0,
      releaseDate: {
        $gte: moment()
          .subtract(7, "days")
          .unix()
      }
    })
  );

  for (let movie of moviesToClose) {
    movie.isClosed = 1;
    await to(movie.save());

    let movieMessage = `🛑 No more predictions allowed for "${movie.title}" 🛑`;

    let voteMessage = `Here's the group's breakdown...` + "\n";
    for (let user in movie.votes) {
      let err, userInfo;
      [err, userInfo] = await to(User.findOne({ _id: user }));
      if (userInfo && userInfo.name !== "Movie Medium") {
        voteMessage =
          voteMessage +
          `👉️ ${userInfo.nickname || userInfo.name}: ${movie.votes[user]}%` +
          "\n";
      }
    }

    await GroupMe.sendBotMessage(movieMessage);
    await GroupMe.sendBotMessage(voteMessage);
  }
};

module.exports = {
  handleMovieCutoffs
};
