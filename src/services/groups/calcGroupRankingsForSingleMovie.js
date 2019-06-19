const { buildSingleUserSingleMovieData } = require("../../util");

module.exports = (groupWithMemberData, movie = {}) => {
  // console.log("PREP", groupWithMemberData, movie);
  let votes = [];
  for (let user of groupWithMemberData.members) {
    if (user.isMM || user.name === "Movie Medium") continue;

    let userMovieData = buildSingleUserSingleMovieData(user, movie);
    votes.push(userMovieData);
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
