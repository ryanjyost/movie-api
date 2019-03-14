const prepSortGroupPredictions = (groupWithMemberData, movie = {}) => {
  // console.log("PREP", groupWithMemberData, movie);
  let votes = [];
  for (let user of groupWithMemberData.members) {
    votes.push({
      name: user.nickname || user.name,
      vote: user.name === "Movie Medium" ? 50 : user.votes[movie._id],
      diff:
        user.votes[movie._id] < 0 && user.name !== "Movie Medium"
          ? 100
          : (user.name === "Movie Medium" ? 50 : user.votes[movie._id]) -
            movie.rtScore
    });
  }

  return votes.sort((a, b) => {
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
