module.exports = (user, movies, season = null) => {
  let moviesInCalc = 0,
    totalDiff = 0;

  for (let movie of movies) {
    let actualScore = movie.rtScore;
    let userPrediction = user.votes[movie._id];

    if (
      actualScore === null ||
      actualScore < 0 ||
      userPrediction === undefined ||
      userPrediction < 0
    ) {
      continue;
    }

    // we know this is a legit movie that the user had a chance to predict
    moviesInCalc++;

    //  penalty
    let diff = Math.abs(actualScore - userPrediction);

    totalDiff = totalDiff + diff;
  }

  const avgDiff = (totalDiff / moviesInCalc).toFixed(1);

  // if user wasn't registered before season started, need to flag
  let notInSeason = false;
  if (season) {
    notInSeason = !!movies.find(movie => !(movie._id in user.votes));
  }

  let eligible = !notInSeason && moviesInCalc;

  return {
    id: user._id,
    user,
    name: user.name,
    avgDiff: eligible ? Math.max(Number(avgDiff), 0) : 101,
    totalDiff: eligible ? totalDiff : -1,
    moviesInCalc,
    notInSeason
  };
};
