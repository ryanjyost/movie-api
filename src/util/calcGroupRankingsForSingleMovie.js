const buildSingleUserSingleMovieData = require("./buildSingleUserSingleMovieData");
const sortAndAddPlacesToData = require("./sortAndAddPlacesToData");

module.exports = (groupWithMemberData, movie = {}) => {
  // console.log("PREP", groupWithMemberData, movie);
  let votes = [];
  for (let user of groupWithMemberData.members) {
    if (user.isMM || user.name === "Movie Medium") continue;

    let userMovieData = buildSingleUserSingleMovieData(user, movie);

    votes.push(userMovieData);
  }

  return sortAndAddPlacesToData(votes, "absDiff", true);
};
