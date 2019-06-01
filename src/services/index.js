const GroupServices = require("./groups");
const UserServices = require("./users");
const MovieServices = require("./movies");

// sometimes just wanna pass through a lower level function
const { Groups, Users, Movies, MovieScoreMap } = require("../models");
const { GroupMe } = require("../platforms");

module.exports = {
  GroupServices: {
    ...GroupServices,
    ...Groups
  },
  UserServices: {
    ...UserServices,
    ...Users
  },
  MovieServices: {
    ...MovieServices,
    ...Movies
  },
  PlatformServices: {
    GroupMe
  },
  MovieScoreMapServices: {
    ...MovieScoreMap
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
