const { GroupServices } = require("../../services");

module.exports = {
  findGroupById: GroupServices.findGroupById,
  getOverallGroupRankings: require("./getOverallGroupRankings"),
  getSeasonRankings: require("./getSeasonRankings"),
  createGroup: require("./createGroup")
};
