const { Seasons, Groups, Movies, MovieScoreMap } = require("../../models");
const { calculateGroupSeasonRankings } = require("../shared");

/*
* Handle movie getting an RT Scores
*/
module.exports = async movie => {
  try {
    // find the most recent season
    let seasonToUpdate = await Seasons.findRecentSeason();

    if (!seasonToUpdate) {
      // no seasons in the DB, so create one
      seasonToUpdate = await Seasons.createNewSeason(1);
      seasonToUpdate.movies.push(movie._id);
    } else if (seasonToUpdate.movies.length + 1 === seasonToUpdate.length) {
      // season ends with the movie being added, so need to analyze old season
      seasonToUpdate.movies.push(movie._id);

      // update winner map with groups and user winner in object
      const winnerMap = await createWinnerMap(seasonToUpdate);
      seasonToUpdate.winnerMap = winnerMap;
    } else if (seasonToUpdate.movies.length === seasonToUpdate.length) {
      // create a new season
      seasonToUpdate = await Seasons.createNewSeason(seasonToUpdate.id + 1);
      seasonToUpdate.movies.push(movie._id);
    } else if (movie.season === seasonToUpdate.id) {
      // nothing, movie is already in the season
    } else {
      // just adding a movie to the season
      seasonToUpdate.movies.push(movie._id);
    }

    seasonToUpdate.save();
    return seasonToUpdate;
  } catch (e) {
    console.log("Error", e);
    throw new Error(e);
  }
};

/*
* Handle movie getting an RT Score
*/
const createWinnerMap = async season => {
  const groups = await Groups.findAllGroups();
  const movies = await Movies.findMoviesBySeason(season.id);
  const winnerMap = {};

  for (let group of groups) {
    const rankings = await calculateGroupSeasonRankings(group, movies, season);
    winnerMap[group._id] = rankings
      .filter(player => {
        return player.place === 1;
      })
      .map(player => player.id);
  }

  return winnerMap;
};

// module.exports = addMovieToSeason;
