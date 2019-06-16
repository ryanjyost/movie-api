const {
  GroupServices,
  MovieServices,
  MovieScoreMapServices,
  PlatformServices
} = require("../../../services");

const { calculateRankings } = require("../../../services/shared");

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

  let text = `🏆 GROUP RANKINGS 🏆` + "\n";

  for (let i = 0; i < rankings.length; i++) {
    if (!rankings[i].moviesInCalc) {
      text =
        text +
        `${i + 1}) ${rankings[i].name}: No prediction history (yet)` +
        "\n";
    } else {
      text =
        text +
        `${i + 1}) ${rankings[i].name}: ${rankings[i].avgDiff.toFixed(1)}%` +
        "\n";
    }
  }

  text =
    text +
    `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;

  await GroupMeServices.sendBotMessage(text, group.bot.bot_id);
};
