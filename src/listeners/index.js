const Emitter = require("../EventEmitter");
const GroupListeners = require("./groups");
const MovieListeners = require("./movies");
const PlatformListeners = require("./platforms");

const Util = require("./util");

// when someone creates a new movie medium group
Emitter.on("createdGroup", GroupListeners.onCreatedGroup);
Emitter.on("createdSlackGroup", GroupListeners.onCreatedSlackGroup);

// new movie was added
Emitter.on("addedMovie", MovieListeners.onAddedMovie);

// admin gave movie an RT Score
Emitter.on("movieGotScore", MovieListeners.onMovieGotScore);

// predictions locked in
Emitter.on("movieClosed", MovieListeners.onMovieClosed);

// existing user invited someone to their group
Emitter.on("userAddedInGroupMe", PlatformListeners.onUserAddedInGroupMe);
Emitter.on("userAddedToSlackChannel", PlatformListeners.onUserAddedToChannel);

Emitter.on("userPredictionOnPlatformSaved", Util.likeMessage);
Emitter.on(
  "userPredictionOnSlackSaved",
  PlatformListeners.respondToSlackPrediction
);
Emitter.on(
  "slackUserMadeBadPrediction",
  PlatformListeners.onSlackUserMadeBadPrediction
);

Emitter.on("slackAppHomeOpened", PlatformListeners.handleSlackAppHomeOpened);

Emitter.on(
  "userPredictedClosedMovie",
  PlatformListeners.onPredictedClosedMovie
);

Emitter.on(
  "userMadeFirstPredictionOnPlatform",
  PlatformListeners.onUserMadeFirstPredictionOnPlatform
);

Emitter.on("feedback", Util.likeMessage);
Emitter.on("feedbackSlack", Util.likeSlackMessage);

Emitter.on("respondedToFeedback", Util.sendMessageToGroup);
