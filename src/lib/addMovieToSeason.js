const Season = require("../seasons/model");
const Groups = require("../groups/index");
const calculateRankings = require("./calculateRankings");

/*
* Handle movie getting an RT Scores
*/
module.exports = async movie => {
  try {
    // find the most recent season
    const mostRecentSeasons = await Season.find()
      .limit(1)
      .sort({ $natural: -1 });

    let seasonToUpdate = mostRecentSeasons.length ? mostRecentSeasons[0] : null;

    if (!seasonToUpdate) {
      // no seasons in the DB, so create one
      seasonToUpdate = await createNewSeason(seasonToUpdate);
      seasonToUpdate.movies.push(movie._id);
    } else if (seasonToUpdate.movies.length + 1 === seasonToUpdate.length) {
      // season ends with the movie being added, so need to analyze old season
      seasonToUpdate.movies.push(movie._id);

      // update winner map with groups and user winner in object
      const winnerMap = await createWinnerMap(seasonToUpdate);
      seasonToUpdate.winnerMap = winnerMap;
    } else if (seasonToUpdate.movies.length === seasonToUpdate.length) {
      // create a new season
      seasonToUpdate = await createNewSeason(seasonToUpdate);
      seasonToUpdate.movies.push(movie._id);
    } else {
      // just adding a movie to the season
      seasonToUpdate.movies.push(movie._id);
    }

    seasonToUpdate.save();
    return seasonToUpdate;
  } catch (e) {
    console.log("Error", e);
  }
};

const createNewSeason = async mostRecentSeason => {
  return await Season.create({
    id: !mostRecentSeason ? 1 : mostRecentSeason.id + 1,
    movies: [],
    length: 5,
    winnerMap: { placeholder: 1 }
  });
};

/*
* Handle movie getting an RT Score
*/
const createWinnerMap = async season => {
  try {
    const groups = await Groups.getGroups();
    const winnerMap = {};

    for (let group of groups) {
      const rankings = await calculateRankings(
        { _id: group._id },
        { season: season.id }
      );
      winnerMap[group._id] = rankings
        .filter(player => {
          return player.place === 1;
        })
        .map(player => player.id);
    }
    return winnerMap;
  } catch (e) {
    console.log("Error", e);
  }
};

// module.exports = addMovieToSeason;
