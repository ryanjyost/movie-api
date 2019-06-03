const Emitter = require("../EventEmitter");
const GroupListeners = require("./groups");
const MovieListeners = require("./movies");
const GroupMeListeners = require("./platforms/groupme");

// when someone creates a new movie medium group
Emitter.on("createdGroup", GroupListeners.onCreatedGroup);

// new movie was added
Emitter.on("addedMovie", MovieListeners.onAddedMovie);

// admin gave movie an RT Score
Emitter.on("movieGotScore", MovieListeners.onMovieGotScore);

// predictions locked in
Emitter.on("movieClosed", MovieListeners.onMovieClosed);

// existing user invited someone to their group
Emitter.on("userAddedInGroupMe", GroupMeListeners.onUserAddedInGroupMe);

Emitter.on("userPredictionOnPlatformSaved", GroupMeListeners.likeMessage);

Emitter.on(
  "userMadeFirstPredictionOnPlatform",
  GroupMeListeners.onUserMadeFirstPredictionOnPlatform
);
