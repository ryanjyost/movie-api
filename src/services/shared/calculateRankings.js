const { calcNoPredictionPenalty } = require("../../util");

module.exports = (users, movies, movieScoreMap, season) => {
  let dataForRankings = [];

  for (let member of users) {
    let user = { ...member.toObject() };

    // don't care about MM user
    if (user.isMM) continue;

    let moviesInCalc = 0,
      totalDiff = 0;

    for (let movie of movies) {
      let actualScore = movie.rtScore;
      let userPrediction = user.votes[movie._id];

      if (
        actualScore === null ||
        actualScore < 0 ||
        userPrediction === undefined
      ) {
        continue;
      }

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

    // if user wasn't registered before season started, need to flag
    let notInSeason = false;
    if (season) {
      notInSeason = !!movies.find(movie => !(movie._id in user.votes));
    }

    let eligible = !notInSeason && moviesInCalc;

    let data = {
      id: user._id,
      user,
      name: user.name,
      avgDiff: eligible ? Math.max(Number(avgDiff), 0) : 101,
      totalDiff: eligible ? totalDiff : -1,
      moviesInCalc,
      notInSeason
    };

    dataForRankings.push(data);
  }

  const sorted = dataForRankings.sort((a, b) => {
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

  const rankingsWithPlaces = [{ ...sorted[0], ...{ place: 1 } }];

  let lastRanking = 1,
    lastRankingScore = sorted[0].avgDiff;
  for (let i = 1; i < sorted.length; i++) {
    let currRanking =
      sorted[i].avgDiff === lastRankingScore ? lastRanking : i + 1;

    rankingsWithPlaces.push({ ...sorted[i], ...{ place: currRanking } });
  }

  return rankingsWithPlaces;
};
