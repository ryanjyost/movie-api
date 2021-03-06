const {
  GroupServices,
  MovieServices,
  MovieScoreMapServices,
  SeasonServices
} = require("../../services");
const Boom = require("@hapi/boom");

const { calculateGroupSeasonRankings } = require("../../services/shared");

module.exports = async (groupId, seasonId) => {
  if (!groupId || !seasonId) {
    throw Boom.badData("Need a group id to calculate season rankings");
  }

  if (seasonId === "recent") {
    const recentSeason = await SeasonServices.findRecentSeason();
    if (recentSeason) {
      seasonId = recentSeason.id;
    } else {
      seasonId = 0;
    }
  }

  const group = await GroupServices.findGroupById(groupId);
  const moviesInSeason = await MovieServices.findMoviesBySeason(seasonId);

  return calculateGroupSeasonRankings(group, moviesInSeason);
};
