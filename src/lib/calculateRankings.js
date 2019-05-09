const MovieScoreMap = require("../../models/movieScoreMap");
const Movies = require("../movies/index");
const Users = require("../users/index");
const Seasons = require("../seasons/index");
const { to, calcNoPredictionPenalty } = require("../helpers/index");
const getGroup = require("../groups/services/getGroup");

/*
* Send rankings to group
*/

const calculateRankings = async (groupQuery, movieQuery = {}) => {
  try {
    let group = null,
      users = [];
    if (groupQuery) {
      group = await getGroup(groupQuery, "members");
      users = group.members;
    } else {
      users = await Users.getUsers();
    }

    let err, movieScoreMap;
    [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));
    if (err) throw new Error();

    // get movies currently in purgatory

    if (movieQuery && movieQuery._id === "recent") {
      let seasons = await Seasons.getSeasons();
      movieQuery = { season: seasons[0].id };
    }

    let movies;
    [err, movies] = await to(Movies.getMovies(movieQuery));

    let dataForRankings = [];

    for (let member of users) {
      let user = { ...member.toObject() };

      // don't care about MM user
      if (user.isMM) continue;

      let moviesInCalc = 0,
        totalDiff = 0;

      for (let movie of movies) {
        let actualScore = movieScoreMap.map[movie._id];
        let userPrediction = user.votes[movie._id];

        if (!actualScore || actualScore < 0 || userPrediction === undefined)
          continue;

        // we know this is a legit movie that the user had a chance to predict
        moviesInCalc++;

        //  penalty
        let diff = 0;
        if (userPrediction < 0) {
          diff = calcNoPredictionPenalty(movie);
        } else {
          diff = Math.abs(actualScore - userPrediction);
        }

        totalDiff = totalDiff + diff;
      }

      const avgDiff = (totalDiff / moviesInCalc).toFixed(1);

      if (!moviesInCalc) {
        let data = {
          id: user._id,
          user,
          name: user.name,
          avgDiff: 101,
          totalDiff: -1,
          moviesInCalc: 0
        };

        dataForRankings.push(data);
      } else {
        let data = {
          id: user._id,
          user,
          name: user.name,
          avgDiff: moviesInCalc > 0 ? Math.max(Number(avgDiff), 0) : 101,
          totalDiff,
          moviesInCalc
        };

        dataForRankings.push(data);
      }
    }

    return dataForRankings.sort((a, b) => {
      a = a < 0 ? { avgDiff: 101 } : a;
      b = b < 0 ? { avgDiff: 101 } : b;
      if (a.avgDiff > b.avgDiff) {
        return 1;
      } else if (a.avgDiff < b.avgDiff) {
        return -1;
      } else {
        return 0;
      }
    });
  } catch (e) {
    console.log("ERROR", e);
  }
};

module.exports = calculateRankings;

// else if (user.isMM) {
// 	let numMoviesEver = 0,
// 		totalDiff = 0;
// 	for (let movie in movieScoreMap.map) {
// 		let actualScore = movieScoreMap.map[movie];
//
// 		//MM always predicts 50
// 		let userPrediction = 50;
//
// 		if (!actualScore || actualScore < 0) continue;
// 		numMoviesEver++;
//
// 		// 100 point penalty
// 		let diff =
// 			userPrediction < 0 ? 100 : Math.abs(actualScore - userPrediction);
//
// 		totalDiff = totalDiff + diff;
// 	}
//
// 	const avgDiff = (totalDiff / numMoviesEver).toFixed(1);
//
// 	let data = {
// 		id: user._id,
// 		name: user.name,
// 		user,
// 		avgDiff: Number(avgDiff),
// 		totalDiff,
// 		moviesInCalc: numMoviesEver
// 	};
//
// 	dataForRankings.push(data);
// }