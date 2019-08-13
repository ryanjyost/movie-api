const {
  GroupServices,
  MovieServices,
  PlatformServices,
  SeasonServices
} = require("../../../services");
const { WebClient } = require("@slack/web-api");

const { calculateGroupSeasonRankings } = require("../../../services/shared");
const { emojiMap } = require("../../../util");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async slackChannelId => {
  try {
    const group = await GroupServices.findGroupBySlackId(slackChannelId);
    const client = new WebClient(group.bot.bot_access_token);

    const recentSeason = await SeasonServices.findRecentSeason();
    const moviesInSeason = await MovieServices.findMoviesBySeason(
      recentSeason.id
    );

    const rankings = await calculateGroupSeasonRankings(group, moviesInSeason);

    let isSeasonOver = recentSeason.length === recentSeason.movies.length;

    let text = isSeasonOver
      ? `*🏁 Season ${recentSeason.id} Results*` + "\n"
      : `*🎗️ Current Season Standings* _${recentSeason.length -
          recentSeason.movies.length} movies left_` + "\n";

    for (let i = 0; i < rankings.length; i++) {
      text =
        text +
        (isSeasonOver ? emojiMap[rankings[i].place - 1] || "" : "") +
        `*${rankings[i].name}* - ${rankings[i].points} _pts_` +
        "\n";
    }

    await client.chat.postMessage({
      channel: group.slackId,
      text
    });
  } catch (e) {
    console.log(e);
  }
};
