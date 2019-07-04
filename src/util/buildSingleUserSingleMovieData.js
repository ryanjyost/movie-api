module.exports = (user, movie, season = null) => {
  let actualScore = movie.rtScore;
  let userPrediction = user.votes[movie._id];
  let noVote = false;

  if (typeof user.votes[movie._id] !== "undefined") {
    //  penalty
    let diff = 0;
    if (userPrediction < 0) {
      diff = 101;
      noVote = true;
    } else {
      diff = Math.abs(actualScore - userPrediction);
    }

    console.log(userPrediction, noVote);

    return {
      id: user._id,
      name: user.nickname || user.name,
      vote: userPrediction,
      diff,
      absDiff: Math.abs(diff),
      didVote: !noVote,
      wasActiveForMovie: true
    };
  } else {
    return {
      id: user._id,
      name: user.nickname || user.name,
      vote: null,
      diff: 101,
      absDiff: 101,
      didVote: false,
      wasActiveForMovie: false
    };
  }
};
