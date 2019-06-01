const { GroupServices } = require("../../services");

module.exports = {
  getGroupById: GroupServices.getGroupById,
  getOverallGroupRankings: require("./getOverallGroupRankings"),
  createGroup: require("./createGroup")
};
