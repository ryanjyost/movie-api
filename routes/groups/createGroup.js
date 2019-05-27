const { GroupMe, Groups, Movies, Users } = require("../../src");
const { moviePredictionCutoffDate } = require("../../helpers");

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
  // need API with Movie Medium access token to create the group
  const GroupMeApi = GroupMe.createApi();

  //... create GroupMe group
  const newGroup = await GroupMeApi.createGroupMeGroup();

  //... get user who's creating the group
  const UserGroupMeApi = GroupMe.createApi(req.body.accessToken);
  const currentUser = await UserGroupMeApi.getCurrentUser();

  //... add user to GroupMe group who's creating the group
  newGroup.members.push(currentUser);

  //... add user who created the MM group to the GroupMe group
  await GroupMeApi.addMemberToGroup(newGroup.id, {
    members: [
      {
        user_id: currentUser.id,
        nickname: currentUser.nickname || currentUser.name
      }
    ]
  });

  //... create bot for the new group
  const groupMeBotResult = await GroupMeApi.createBot(newGroup.id);

  // add new bot info to group
  newGroup.bot = groupMeBotResult.bot;

  //... create MM group
  const createdGroup = await Groups.createGroup(newGroup);

  // send welcome message
  await GroupMe.sendBotMessage(
    `You're ready to start predicting Rotten Tomatoes Scores 🎉 Invite more friends to this chat and they'll be ready to play, too.` +
      "\n" +
      "\n" +
      `Learn how to play and manage predictions at moviemedium.io`,
    groupMeBotResult.bot.bot_id
  );

  //.... get upcoming movies to show example of one to predict
  const upcomingMovies = await Movies.getMovies(
    {
      rtScore: { $lt: 0 },
      releaseDate: { $gt: moviePredictionCutoffDate },
      isClosed: 0
    },
    { releaseDate: 1 }
  );

  if (upcomingMovies.length) {
    await GroupMe.sendBotMessage(
      `There are ${
        upcomingMovies.length
      } upcoming movies for you to predict. Get started with this one that's close to locking in predictions!`,
      groupMeBotResult.bot.bot_id
    );

    await GroupMe.sendBotMessage(
      `🍿 ${upcomingMovies[0].title}`,
      groupMeBotResult.bot.bot_id
    );

    await GroupMe.sendBotMessage(
      `${upcomingMovies[0].trailer}`,
      groupMeBotResult.bot.bot_id
    );

    await GroupMe.sendBotMessage(
      `To predict within this GroupMe chat, simply post a message with the structure "movie title = percentage%" So if you think ${
        upcomingMovies[0].title
      } is going to get a Rotten Tomatoes Score of 59%, simply send the message "${
        upcomingMovies[0].title
      } = 59%"`,
      groupMeBotResult.bot.bot_id
    );
  }

  const user = await to(
    Users.getUser(
      { groupmeId: currentUser.user_id },
      {},
      { path: "groups", populate: { path: "members" } }
    )
  );

  res.json({ createdGroup, user });
};
