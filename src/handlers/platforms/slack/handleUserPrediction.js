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
    console.log(reqBody);
    const { text } = reqBody;

    // let user = await UserServices.findUserBySlackId(reqBody.user_id);
    const group = await GroupServices.findGroupBySlackId(reqBody.channel_id);

    if (!text.length) {
      Emitter.emit("slackUserPredictingGeneral", group, reqBody.user_id);
      return;
    }
    //
    // const split = text.includes("=") ? text.split("=") : text.split("-");
    // if (!split[1]) {
    //   Emitter.emit("slackUserPredictingGeneral", user, group);
    //   return;
    // }

    let title = text.trim();
    let cleanTitle = sanitizeTitle(title);
    // const rawScore = split[1].trim().replace("%", "");
    // const scoreNum = Number(rawScore);

    // handle invalid prediction
    // if (
    //   isNaN(scoreNum) ||
    //   !(scoreNum >= 0 && scoreNum <= 100) ||
    //   !Number.isInteger(scoreNum)
    // ) {
    //   Emitter.emit("slackUserMadeBadPrediction", user, group);
    //   return;
    // }

    // look for exact match
    let movie = await MovieServices.findMovieByCleanTitle(cleanTitle);
    console.log("MOVIE", movie);

    if (!movie) {
      movie = await MovieServices.fuzzySearchMovies(cleanTitle);

      if (!movie) {
        Emitter.emit("slackUserPredictingGeneral", group, reqBody.user_id);
        return;
      }
    }

    if (movie.isClosed) {
      Emitter.emit("userPredictedClosedMovie", user, group);
      return;
    } else {
      // WE NEED TO SEND A BUTTON TO PREDICT
      Emitter.emit(
        "slackUserPredictingSpecific",
        group,
        reqBody.user_id,
        movie
      );
      return;
    }

    return;

    // if (!user) {
    //   const client = new WebClient(group.bot.bot_access_token);
    //   const userResponse = await client.users.info({ user: reqBody.user_id });
    //   // user = await UserServices.findOrCreateSlackUser(
    //   //   userResponse.user,
    //   //   group._id
    //   // );
    // }

    // const updatedUser = await UserServices.updateUserPrediction(
    //   user._id,
    //   movie._id,
    //   scoreNum
    // );
    //
    // const updatedMovie = await MovieServices.updateMovieVotes(
    //   user._id,
    //   movie._id,
    //   scoreNum
    // );

    // if (updatedUser && updatedMovie) {
    //   Emitter.emit("userPredictionOnSlackSaved", user, group);
    //   return;
    // }

    // const isUserInGroupWherePredicted = user.groups.find(group => {
    //   return group.slackId === reqBody.channel_id;
    // });
    //
    // // if (!isUserInGroupWherePredicted) {
    // //   await GroupServices.addUserToGroup(
    // //     { groupmeId: groupmeGroupId },
    // //     user._id
    // //   );
    // //   await UserServices.addGroupToUser(user._id, group._id);
    // // }
  } catch (e) {
    console.log("ERROR", e);
  }
};
