const { MovieServices, GroupServices } = require("../../services");
const {
  moviePredictionCutoffDate,
  calcNoPredictionPenalty
} = require("../../util");

module.exports = async (groupId, type) => {
  let movies = [];
  if (type === "purgatory") {
    movies = await MovieServices.findMoviesInPurgatory();
  } else if (type === "past") {
    movies = await MovieServices.findMoviesWithScore();
  }

  //... get group info
  const group = await GroupServices.findGroupById(groupId);

  const breakdowns = {};

  // calc prediction results for all movies
  for (let movie of movies) {
    let userData = [];
    for (let user of group.members) {
      if (user.isMM) continue;
      let prediction = [movie._id] in user.votes ? user.votes[movie._id] : null;

      let diff =
        prediction < 0
          ? calcNoPredictionPenalty(movie)
          : movie.rtScore - prediction;

      userData.push({
        id: user._id,
        name: user.name,
        prediction,
        diff,
        absDiff: Math.abs(diff)
      });
    }

    breakdowns[movie._id] = userData;
  }

  return breakdowns;
};
