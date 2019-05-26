const Group = require("../../src/groups/model");
const { to, moviePredictionCutoffDate, catchErrors } = require("../../helpers");
const GroupMe = require("../../src/platforms/groupme/index");
const Users = require("../../src/users/index");
const Movies = require("../../src/movies/index");

const express = require("express");
const router = express.Router();

// services
const getGroups = require("../../src/groups/services/getGroups");
const createGroup = require("../../src/groups/services/createGroup.js");
const calculateRankings = require("../../src/lib/calculateRankings");
const getSeasonBreakdowns = require("../../src/groups/services/getSeasonBreakdowns");

const getGroup = require("./getGroup");

const getGroupRankings = async (req, res, next) => {
  let err, rankings;
  [err, rankings] = await to(
    calculateRankings(
      req.params.id === "all" ? null : { _id: req.params.id },
      req.params.seasonId ? { _id: req.params.seasonId } : null
    )
  );
  if (err) next(err);

  res.json({ rankings });
};

const getGroupSeasons = async (req, res, next) => {
  let err, rankings;
  [err, rankings] = await to(
    getSeasonBreakdowns(
      req.params.groupId === "all" ? null : { _id: req.params.groupId },
      req.params.seasonId || { _id: req.params.seasonId }
    )
  );
  if (err) next(err);

  res.json({ rankings });
};

const createGroupHandler = async (req, res, next) => {
  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);

  //... create GroupMe group
  let err, newGroupMeGroup;
  [err, newGroupMeGroup] = await to(GroupMeApi.createGroupMeGroup());
  if (err) {
    next(err);
    return;
  }

  //... get user who's creating the group
  const UserGroupMeApi = GroupMe.createApi(req.body.accessToken);
  let currentUser;
  [err, currentUser] = await to(UserGroupMeApi.getCurrentUser());
  if (err) next(err);

  //... add user to GroupMe group who's creating the group
  newGroupMeGroup.members.push(currentUser);

  let addUserResult;
  [err, addUserResult] = await to(
    GroupMeApi.addMemberToGroup(newGroupMeGroup.id, {
      members: [
        {
          user_id: currentUser.id,
          nickname: currentUser.nickname || currentUser.name
        }
      ]
    })
  );
  if (err) next(err);

  //... create bot
  let groupMeBotResult;
  [err, groupMeBotResult] = await to(GroupMeApi.createBot(newGroupMeGroup.id));
  if (err) next(err);

  newGroupMeGroup.bot = groupMeBotResult.bot;

  //... create MM group TODO with members
  let createdGroup;
  [err, createdGroup] = await to(createGroup(newGroupMeGroup));
  if (err) next(err);

  // send welcome message
  await to(
    GroupMe.sendBotMessage(
      `You're ready to start predicting Rotten Tomatoes Scores 🎉 Invite more friends to this chat and they'll be ready to play, too.` +
        "\n" +
        "\n" +
        `Learn how to play and manage predictions at moviemedium.io`,
      groupMeBotResult.bot.bot_id
    )
  );

  let upcomingMovies;
  [err, upcomingMovies] = await to(
    Movies.getMovies(
      {
        rtScore: { $lt: 0 },
        releaseDate: { $gt: moviePredictionCutoffDate },
        isClosed: 0
      },
      { releaseDate: 1 }
    )
  );

  if (err) next(err);

  if (upcomingMovies.length) {
    await to(
      GroupMe.sendBotMessage(
        `There are ${
          upcomingMovies.length
        } upcoming movies for you to predict. Get started with this one that's close to locking in predictions!`,
        groupMeBotResult.bot.bot_id
      )
    );

    [err, response] = await to(
      GroupMe.sendBotMessage(
        `🍿 ${upcomingMovies[0].title}`,
        groupMeBotResult.bot.bot_id
      )
    );
    [err, response] = await to(
      GroupMe.sendBotMessage(
        `${upcomingMovies[0].trailer}`,
        groupMeBotResult.bot.bot_id
      )
    );

    await to(
      GroupMe.sendBotMessage(
        `To predict within this GroupMe chat, simply post a message with the structure "movie title = percentage%" So if you think ${
          upcomingMovies[0].title
        } is going to get a Rotten Tomatoes Score of 59%, simply send the message "${
          upcomingMovies[0].title
        } = 59%"`,
        groupMeBotResult.bot.bot_id
      )
    );
  }

  if (err) next(err);

  let user;
  [err, user] = await to(
    Users.getUser(
      { groupmeId: currentUser.user_id },
      {},
      { path: "groups", populate: { path: "members" } }
    )
  );
  if (err) next(err);

  res.json({ createdGroup, user });
};

const sendMessageToAllGroups = async (req, res, next) => {
  let err, groups;
  [err, groups] = await to(getGroups());
  if (err) next(err);

  for (let group of groups) {
    await GroupMe.sendBotMessage(req.body.message, group.bot.bot_id);
  }

  res.json({ message: req.body.message, groups: groups });
};

/* Get single group info */
router.get("/:id", catchErrors(getGroup));

/* Create a group */
router.post("/create", createGroupHandler);

/* Get group rankings */
router.get("/:id/rankings", getGroupRankings);

/* Get group rankings for a specific season */
router.get("/:id/rankings/:seasonId", getGroupRankings);

/* Get season breakdowns for groups */
router.get("/:groupId/seasons/:seasonId", getGroupSeasons);

// send message to all groups
router.post("/message", sendMessageToAllGroups);

module.exports = router;
