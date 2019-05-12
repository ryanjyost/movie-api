const MovieScoreMap = require("../../../models/movieScoreMap");
const Movies = require("../../movies");
const { to, calcNoPredictionPenalty } = require("../../helpers");
const getGroup = require("./getGroup");

/*
* Send rankings to group
*/

const calculateRankings = async query => {
  try {
    let err, group;
    [err, group] = await to(getGroup(query, "members"));
    if (err) throw new Error();

    let movieScoreMap;
    [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));
    if (err) throw new Error();

    // get movies currently in purgatory
    let movies;
    [err, movies] = await to(Movies.getMovies());

    let dataForRankings = [];

    for (let member of group.members) {
      let user = { ...member.toObject() };

      if (user && !user.isMM) {
        let numMoviesUserPredicted = 0,
          totalDiff = 0;

        for (let movieId in user.votes) {
          let actualScore = movieScoreMap.map[movieId];

          let userPrediction = user.votes[movieId];

          if (!actualScore || actualScore < 0) continue;
          numMoviesUserPredicted++;

          // 100 point penalty
          let diff = 0;
          if (userPrediction < 0) {
            let movie = movies.find(item => item._id.toString() === movieId);
            if (!movie) continue;
            diff = calcNoPredictionPenalty(movie);
          } else {
            diff = Math.abs(actualScore - userPrediction);
          }

          totalDiff = totalDiff + diff;
        }

        const avgDiff = (totalDiff / numMoviesUserPredicted).toFixed(1);

        if (!numMoviesUserPredicted) {
          let data = {
            id: user._id,
            name: user.name,
            avgDiff: 101,
            totalDiff: -1,
            numMoviesUserPredicted: 0
          };

          dataForRankings.push(data);
        } else {
          let data = {
            id: user._id,
            name: user.name,
            avgDiff: numMoviesUserPredicted > 0 ? Number(avgDiff) : 101,
            totalDiff,
            numMoviesUserPredicted
          };

          dataForRankings.push(data);
        }
      } else if (user.isMM) {
        let numMoviesEver = 0,
          totalDiff = 0;
        for (let movie in movieScoreMap.map) {
          let actualScore = movieScoreMap.map[movie];

          //MM always predicts 50
          let userPrediction = 50;

          if (!actualScore || actualScore < 0) continue;
          numMoviesEver++;

          // 100 point penalty
          let diff =
            userPrediction < 0 ? 100 : Math.abs(actualScore - userPrediction);

          totalDiff = totalDiff + diff;
        }

        const avgDiff = (totalDiff / numMoviesEver).toFixed(1);

        let data = {
          id: user._id,
          name: user.name,
          avgDiff: Number(avgDiff),
          totalDiff,
          numMoviesUserPredicted: numMoviesEver
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
