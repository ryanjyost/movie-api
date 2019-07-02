const { buildSingleUserManyMovieData } = require("../../util");

const sortAndAddPlacesToData = require("../../util/sortAndAddPlacesToData");

module.exports = (users, movies, movieScoreMap, season) => {
  let dataForRankings = [];

  for (let member of users) {
    let user = { ...member.toObject() };

    // don't care about MM user
    if (user.isMM) continue;

    const singleUserManyMovieData = buildSingleUserManyMovieData(
      user,
      movies,
      season
    );

    dataForRankings.push(singleUserManyMovieData);
  }

  return sortAndAddPlacesToData(dataForRankings, "avgDiff", true);
};
