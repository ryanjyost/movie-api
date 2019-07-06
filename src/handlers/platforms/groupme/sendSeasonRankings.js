const {
  GroupServices,
  MovieServices,
  MovieScoreMapServices,
  PlatformServices,
  SeasonServices
} = require("../../../services");

const { calculateGroupSeasonRankings } = require("../../../services/shared");
const { emojiMap } = require("../../../util");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async groupmeGroupId => {
  try {
    const group = await GroupServices.findGroupByGroupMeId(groupmeGroupId);

    const recentSeason = await SeasonServices.findRecentSeason();
    const moviesInSeason = await MovieServices.findMoviesBySeason(
      recentSeason.id
    );

    const rankings = await calculateGroupSeasonRankings(group, moviesInSeason);

    let isSeasonOver = recentSeason.length === recentSeason.movies.length;

    let text = isSeasonOver
      ? `🏆 Season ${recentSeason.id} Results 🏆` + "\n"
      : `🏆 Current Season Standings - ${recentSeason.length -
          recentSeason.movies.length} movies left` + "\n";

    for (let i = 0; i < rankings.length; i++) {
      text =
        text +
        (isSeasonOver ? emojiMap[rankings[i].place - 1] || "" : "") +
        `${rankings[i].name}: ${rankings[i].points} pts` +
        "\n";
    }

    await GroupMeServices.sendBotMessage(text, group.bot.bot_id);
  } catch (e) {
    console.log(e);
  }
};
