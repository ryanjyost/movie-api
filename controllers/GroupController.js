const to = require("../lib/to.js");
const User = require("../models/user.js");
const MovieScoreMap = require("../models/movieScoreMap.js");
const Group = require("../models/group.js");

/*
* Create an MM group from GroupMe group
*/
const create = async groupMeId => {
  // 46925214
  // stuff we need
  const GroupMe = require("../lib/groupme/index.js");
  const UserController = require("../controllers/UserController.js");
  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);

  //..... get group info from GroupMe
  let err, groupmeGroup;
  [err, groupmeGroup] = await to(GroupMeApi.get(`groups/${groupMeId}`));

  // if the groupme group was found
  if (groupmeGroup) {
    // start building new group
    let newGroup = {
      name: groupmeGroup.data.response.name,
      groupmeId: groupmeGroup.data.response.group_id,
      groupme: { ...groupmeGroup.data.response }
    };

    //...loop through GroupMe members and find or create MM users
    let membersForGroup = [];
    const members = groupmeGroup.data.response.members;
    for (let member of members) {
      let err, user;
      [err, user] = await to(
        UserController._findOrCreateUser(
          member,
          groupmeGroup.data.response.group_id
        )
      );

      // add user ids to new group
      if (user) {
        membersForGroup.push(user._id);
      }
    }

    newGroup.members = membersForGroup;

    // actually create the MM group
    let createdGroup;
    [err, createdGroup] = await to(Group.create(newGroup));
    return createdGroup;
  } else {
    // GroupMe didn't send back a group, so nothing
    return null;
  }
};

/*
* Send rankings to group
*/
const _calcRankings = async groupmeId => {
  const GroupMe = require("../lib/groupme/index.js");
  const UserController = require("../controllers/UserController.js");
  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);
  let err, response;
  [err, response] = await to(GroupMeApi.get(`groups/${46885156}`));

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

const _addUserToGroup = async (userId, groupmeId) => {
  let err, group;
  [err, group] = await to(
    Group.findOneAndUpdate({ groupmeId }, { $push: { members: userId } })
  );
};

module.exports = {
  create,
  _calcRankings,
  _addUserToGroup
};
