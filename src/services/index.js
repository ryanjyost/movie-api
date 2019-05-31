const { Groups } = require("../models");

module.exports = {
  GroupServices: {
    getGroupById: Groups.getGroupById
  },

  //////////////////////
  addMovieToSeason: require("./addMovieToSeason"),
  calculateRankings: require("./calculateRankings"),
  calcMovieMetrics: require("./calcMovieMetrics"),
  calcSingleMovieMetrics: require("./calcSingleMovieMetrics"),
  updateMovieScoreMap: require("./updateMovieScoreMap"),
  sendMovieScoreResultsToAllGroups: require("./sendMovieScoreResultsToAllGroups"),
  handleUserPrediction: require("./handleUserPrediction"),
  handleGroupMeAutomatedMessage: require("./handleGroupMeAutomatedMessage"),
  sendGroupRankings: require("./sendGroupRankings")
};
