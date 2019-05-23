const { calcNoPredictionPenalty } = require("../../helpers");

const prepSortGroupPredictions = (groupWithMemberData, movie = {}) => {
  // console.log("PREP", groupWithMemberData, movie);
  let votes = [];
  for (let user of groupWithMemberData.members) {
    if (user.isMM || user.name === "Movie Medium") continue;

    let actualScore = movie.rtScore;
    let userPrediction = user.votes[movie._id];
    let noVote = false;

    if (typeof user.votes[movie._id] !== "undefined") {
      //  penalty
      let diff = 0;
      if (userPrediction < 0) {
        diff = calcNoPredictionPenalty(movie);
        noVote = true;
      } else {
        diff = Math.abs(actualScore - userPrediction);
      }

      votes.push({
        name: user.nickname || user.name,
        vote: user.name === "Movie Medium" ? 50 : userPrediction,
        diff,
        didVote: !noVote,
        wasActiveForMovie: true
      });
    } else {
      votes.push({
        name: user.nickname || user.name,
        vote: null,
        diff: -1,
        didVote: !noVote,
        wasActiveForMovie: false
      });
    }
  }

  return votes.sort((a, b) => {
    a.diff = !a.wasActiveForMovie ? 101 : a.diff;
    b.diff = !b.wasActiveForMovie ? 101 : b.diff;

    if (Math.abs(a.diff) > Math.abs(b.diff)) {
      return 1;
    } else if (Math.abs(b.diff) > Math.abs(a.diff)) {
      return -1;
    } else {
      return 0;
    }
  });
};

module.exports = prepSortGroupPredictions;
