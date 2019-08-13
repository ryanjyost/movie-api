const {
  GroupServices,
  MovieServices,
  MovieScoreMapServices,
  PlatformServices
} = require("../../../services");

const { calculateRankings } = require("../../../services/shared");
const { messages } = require("../../../util");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async groupmeGroupId => {
  const group = await GroupServices.findGroupByGroupMeId(groupmeGroupId);
  const movieScoreMap = await MovieScoreMapServices.get();
  const allMovies = await MovieServices.findAllMovies();

  const rankings = await calculateRankings(
    group.members,
    allMovies,
    movieScoreMap
  );

  const text = messages.overallRankings(rankings);

  await GroupMeServices.sendBotMessage(text, group.bot.bot_id);
};
