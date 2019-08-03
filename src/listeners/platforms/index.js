module.exports = {
  onUserAddedInGroupMe: require("./groupme/onUserAddedInGroupMe"),
  respondToSlackPrediction: require("./slack/respondToSlackPrediction"),
  onUserAddedToChannel: require("./slack/onUserAddedToChannel"),
  onUserMadeFirstPredictionOnPlatform: require("./groupme/onUserMadeFirstPredictionOnPlatform"),
  onSlackUserMadeBadPrediction: require("./slack/onSlackUserMadeBadPrediction"),
  onPredictedClosedMovie: require("./slack/onPredictedClosedMovie"),
  handleSlackAppHomeOpened: require("./slack/handleSlackAppHomeOpened")
};
