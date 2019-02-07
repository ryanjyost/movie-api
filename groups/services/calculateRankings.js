const MovieScoreMap = require("../../models/movieScoreMap.js");

/*
* Send rankings to group
*/

module.exports = async groupmeId => {
  const GroupMe = require("../../lib/groupme/index.js");
  const UserController = require("../../controllers/UserController.js");
  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);
  let err, response;
  [err, response] = await to(GroupMeApi.get(`groups/${groupmeId}`));

  let group = response.data.response;

  let movieScoreMap;
  [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));

  // if (!group) {
  //   await to(create(groupmeId));
  // }

  try {
    // console.log(movieScoreMap);
    let dataForRankings = [];

    for (let member of group.members) {
      let err, user;
      [err, user] = await to(
        UserController._findOrCreateUser(member, group.group_id)
      );

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

    let text = `🏆 GROUP RANKINGS 🏆` + "\n";

    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].numMoviesUserPredicted) {
        text = text + `${i + 1}) ${sorted[i].name} - N/A` + "\n";
      } else {
        text =
          text +
          `${i + 1}) ${sorted[i].name} - ${sorted[i].avgDiff.toFixed(1)}%` +
          "\n";
      }
    }

    text =
      text +
      `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;
    await GroupMe.sendBotMessage(text);
  } catch (e) {
    console.log("ERROR", e);
  }
};
