const {
  buildSingleUserManyMovieData,
  calcGroupRankingsForSingleMovie
} = require("../../util");
const sortAndAddPlacesToData = require("../../util/sortAndAddPlacesToData");

module.exports = async (group, movies, season) => {
  let arrayOfMoviePredictionObjects = [];

  for (let movie of movies) {
    const movieRankings = calcGroupRankingsForSingleMovie(group, movie, true);
    const movieRankingsAsObject = {};
    for (let user of movieRankings) {
      movieRankingsAsObject[user.id] = user;
    }

    arrayOfMoviePredictionObjects.push(movieRankingsAsObject);
  }

  let finalUserMovieData = {};
  for (let groupMovieRankings of arrayOfMoviePredictionObjects) {
    for (let userId in groupMovieRankings) {
      const currentUserData = groupMovieRankings[userId];
      if (!(userId in finalUserMovieData)) {
        finalUserMovieData[userId] = {
          id: currentUserData.id,
          name: currentUserData.name,
          points: currentUserData.didVote ? currentUserData.points : 0
        };
      } else {
        finalUserMovieData[userId].points =
          finalUserMovieData[userId].points +
          (currentUserData.didVote ? currentUserData.points : 0);
      }
    }
  }

  // convert back to array
  let arrayWithTotalPoints = [];
  for (let userId in finalUserMovieData) {
    arrayWithTotalPoints.push(finalUserMovieData[userId]);
  }

  //TODO avg diff tiebraker
  return sortAndAddPlacesToData(arrayWithTotalPoints, "points", false);
};
