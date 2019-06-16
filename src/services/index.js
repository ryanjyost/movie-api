const GroupServices = require("./groups");
const UserServices = require("./users");
const MovieServices = require("./movies");
const MovieScoreMapServices = require("./movieScoreMap");
const SeasonServices = require("./seasons");
const SharedServices = require("./shared");

// sometimes just wanna pass through a lower level function
const {
  Groups,
  Users,
  Movies,
  MovieScoreMap,
  Seasons,
  Feedback
} = require("../models");
const { GroupMe } = require("../platforms");

module.exports = {
  GroupServices: {
    ...Groups,
    ...GroupServices
  },
  UserServices: {
    ...Users,
    ...UserServices
  },
  MovieServices: {
    ...Movies,
    ...MovieServices
  },
  PlatformServices: {
    GroupMe
  },
  MovieScoreMapServices: {
    ...MovieScoreMap,
    ...MovieScoreMapServices
  },
  SeasonServices: {
    ...SeasonServices,
    ...Seasons
  },
  FeedbackServices: Feedback,
  SharedServices

  // //////////////////////
  // calculateRankings: require("./calculateRankings"),
  // calcMovieMetrics: require("./calcMovieMetrics"),
  // calcSingleMovieMetrics: require("./movies/calcSingleMovieMetrics"),
  // // sendMovieScoreResultsToAllGroups: require("./sendMovieScoreResultsToAllGroups"),
  // handleGroupMeAutomatedMessage: require("../handlers/platforms/groupme/handleGroupMeAutomatedMessage")
};
