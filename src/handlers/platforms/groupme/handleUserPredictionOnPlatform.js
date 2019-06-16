const {
  GroupServices,
  MovieServices,
  UserServices
} = require("../../../services");
const { sanitizeTitle } = require("../../../util");
const Emitter = require("../../../EventEmitter");

module.exports = async reqBody => {
  const { text, user_id, group_id, id } = reqBody;
  const groupmeGroupId = group_id;
  const messageId = id;
  const userGroupmeId = user_id;

  // prep text
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
    // await GroupMe.sendBotMessage(
    //   `"${movie.title}" is passed the prediction deadline ☹️`,
    //   group.bot.bot_id
    // );
    return;
  }

  const user = await UserServices.findUserByGroupMeId(userGroupmeId);
  const group = await GroupServices.findGroupByGroupMeId(groupmeGroupId);

  if (movie && user) {
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
      Emitter.emit("userPredictionOnPlatformSaved", groupmeGroupId, messageId);
      return;
    }

    const isUserInGroupWherePredicted = user.groups.find(group => {
      return group.groupme.id === groupmeGroupId;
    });

    if (!isUserInGroupWherePredicted) {
      await GroupServices.addUserToGroup(
        { groupmeId: groupmeGroupId },
        user._id
      );
      await UserServices.addGroupToUser(user._id, group._id);
    }
  } else if (!user && movie) {
    const newUser = await UserServices.createUser({
      groupme: reqBody,
      groupmeId: userGroupmeId,
      name: reqBody.name,
      nickname: reqBody.name,
      votes: { [movie._id]: rawScore },
      groups: group ? [group._id] : []
    });

    // first time user
    if (newUser) {
      await GroupServices.addUserToGroup({ _id: group._id }, newUser._id);
      Emitter.emit(
        "userMadeFirstPredictionOnPlatform",
        group.bot.bot_id,
        reqBody.name,
        messageId,
        groupmeGroupId
      );
    }
  }

  return;
};
