const to = require("../lib/to.js");
const User = require("../models/user.js");
const MovieScoreMap = require("../models/movieScoreMap.js");
const Group = require("../models/group.js");
const axios = require("axios");

const getGroups = async (req, res, nonHTTPQuery) => {
  let query = nonHTTPQuery || {};

  let err, groups;
  [err, groups] = await to(Group.find(query));
};

const create = async groupMeId => {
  // const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);
  const GroupMeApi = axios.create({
    baseURL: "https://api.groupme.com/v3",
    timeout: 10000,
    headers: {
      "X-Custom-Header": "foobar",
      "Content-Type": "application/json",
      Host: "api.groupme.com",
      "X-Access-Token": process.env.GROUPME_ACCESS_TOKEN
    }
  });

  let err, groupMeGroup;
  [err, groupMeGroup] = await to(GroupMeApi.get(`groups/${groupMeId}`));
  if (groupMeGroup) {
    let newGroup = {
      name: groupMeGroup.data.response.name,
      groupmeId: groupMeGroup.data.response.group_id,
      groupme: { ...groupMeGroup.data.response }
    };

    let membersForGroup = [];
    const members = groupMeGroup.data.response.members;
    for (let member of members) {
      let err,
        existingMember = null;
      [err, existingMember] = await to(
        User.findOne({ groupmeId: member.user_id })
      );

      if (existingMember) {
        membersForGroup.push(existingMember._id);
      } else {
        let err, newUser;
        [err, newUser] = await to(
          User.create({
            groupme: member,
            groupmeId: member.user_id,
            name: member.name,
            nickname: member.nickname,
            votes: { placholder: 1 }
          })
        );
        if (newUser) {
          membersForGroup.push(newUser._id);
        }

        if (err) {
          console.log("ERROR", err);
        }
      }
    }

    newGroup.members = membersForGroup;

    let createdGroup;
    [err, createdGroup] = await to(Group.create(newGroup));
    return createdGroup;
  } else {
    console.log("NO GROUP");
    return null;
  }
  return null;
};

const calcRankings = async groupmeId => {
  const GroupMe = require("../lib/GroupMe.js");
  let err, group, users, movieScoreMap;
  [err, group] = await to(Group.findOne({ groupmeId }));

  if (!group) {
    create(groupmeId);
  }

  try {
    [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));

    // console.log(movieScoreMap);
    let dataForRankings = [];

    for (let member of group.members) {
      let err, user;
      [err, user] = await to(User.findOne({ _id: member }));

      let numMoviesUserPredicted = 0,
        totalDiff = 0;

      for (let movieId in user.votes) {
        let actualScore = movieScoreMap.map[movieId];
        if (actualScore < 0) continue;
        numMoviesUserPredicted++;

        let diff = Math.abs(actualScore - user.votes[movieId]);
        // console.log(actualScore, user.votes[movieId], diff);

        totalDiff = totalDiff + diff;
      }

      const avgDiff = totalDiff / numMoviesUserPredicted;
      let data = {
        name: user.name,
        avgDiff,
        totalDiff,
        numMoviesUserPredicted
      };

      dataForRankings.push(data);
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
      text =
        text +
        `${i + 1}) ${sorted[i].name} - ${sorted[i].avgDiff.toFixed(1)}%` +
        "\n";
    }

    text =
      text +
      `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;
    await GroupMe.sendBotMessage(text);
  } catch (e) {
    console.log("ERROR", e);
  }
};

module.exports = {
  create,
  getGroups,
  calcRankings
};
