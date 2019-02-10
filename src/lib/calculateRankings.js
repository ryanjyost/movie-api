const MovieScoreMap = require("../../models/movieScoreMap.js");
const Users = require("../users");
const GroupMe = require("../platforms/groupme");
const { to } = require("../helpers");

/*
* Send rankings to group
*/

const calculateRankings = async groupmeId => {
  console.log("CALCULATE");
  let err, group;
  [err, group] = await to(GroupMe.getGroup(groupmeId));
  if (err) throw new Error();

  let movieScoreMap;
  [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));
  if (err) throw new Error();

  // if (!group) {
  //   await to(create(groupmeId));
  // }

  try {
    // console.log(movieScoreMap);
    let dataForRankings = [];

    for (let member of group.members) {
      let err, user;
      [err, user] = await to(Users.findOrCreateUser(member, group.group_id));

      if (user && user.name !== "Movie Medium") {
        let numMoviesUserPredicted = 0,
          totalDiff = 0;

        for (let movieId in user.votes) {
          let actualScore = movieScoreMap.map[movieId];
          if (!actualScore || actualScore < 0) continue;
          numMoviesUserPredicted++;

          let diff = Math.abs(actualScore - user.votes[movieId]);
          // console.log(actualScore, user.votes[movieId], diff);

          totalDiff = totalDiff + diff;
        }

        const avgDiff = totalDiff / numMoviesUserPredicted;

        if (!numMoviesUserPredicted) {
          let data = {
            name: user.name,
            avgDiff: 10000000,
            totalDiff: 1000000000,
            numMoviesUserPredicted: 0
          };

          dataForRankings.push(data);
        } else {
          let data = {
            name: user.name,
            avgDiff,
            totalDiff,
            numMoviesUserPredicted
          };

          dataForRankings.push(data);
        }
      }
    }

    const sorted = dataForRankings.sort((a, b) => {
      if (a.avgDiff > b.avgDiff) {
        return 1;
      } else if (a.avgDiff < b.avgDiff) {
        return -1;
      } else {
        return 0;
      }
    });

    return sorted;
  } catch (e) {
    console.log("ERROR", e);
  }
};

module.exports = calculateRankings;
