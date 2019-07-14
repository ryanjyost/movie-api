const {
  GroupServices,
  MovieServices,
  UserServices
} = require("../../../services");
const { sanitizeTitle } = require("../../../util");
const Emitter = require("../../../EventEmitter");
const { WebClient } = require("@slack/web-api");

module.exports = async reqBody => {
  try {
    const { text } = reqBody;
    console.log("PREDICT", reqBody);

    const split = text.includes("=") ? text.split("=") : text.split("-");
    let title = split[0].trim();
    let cleanTitle = sanitizeTitle(title);
    const rawScore = split[1].trim().replace("%", "");
    const scoreNum = Number(rawScore);

    // handle invalid prediction
    if (isNaN(scoreNum)) {
      return;
    } else if (!(scoreNum >= 0 && scoreNum <= 100)) {
      return;
    }

    // look for exact match
    let movie = await MovieServices.findMovieByCleanTitle(cleanTitle);

    if (!movie) {
      movie = await MovieServices.fuzzySearchMovies(cleanTitle);

      if (!movie) return null;
    }

    if (movie.isClosed) {
      return;
    }

    console.log("MOVIE", movie);

    let user = await UserServices.findUserBySlackId(reqBody.user_id);

    const group = await GroupServices.findGroupBySlackId(reqBody.channel_id);

    if (!user) {
      const client = new WebClient(process.env.SLACK_ACCESS_TOKEN);
      const userResponse = await client.users.info({ user: reqBody.user_id });
      user = await UserServices.findOrCreateSlackUser(
        userResponse.user,
        group._id
      );
    }

    const updatedUser = await UserServices.updateUserPrediction(
      user._id,
      movie._id,
      scoreNum
    );

    const updatedMovie = await MovieServices.updateMovieVotes(
      user._id,
      movie._id,
      scoreNum
    );

    if (updatedUser && updatedMovie) {
      Emitter.emit(
        "userPredictionOnSlackSaved",
        reqBody.channel_id,
        reqBody.user_id,
        group.bot,
        movie,
        scoreNum
      );
      return;
    }

    const isUserInGroupWherePredicted = user.groups.find(group => {
      return group.slackId === reqBody.channel_id;
    });

    // if (!isUserInGroupWherePredicted) {
    //   await GroupServices.addUserToGroup(
    //     { groupmeId: groupmeGroupId },
    //     user._id
    //   );
    //   await UserServices.addGroupToUser(user._id, group._id);
    // }
  } catch (e) {
    console.log("ERROR", e);
  }
};
