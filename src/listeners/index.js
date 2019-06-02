const Emitter = require("../EventEmitter");
const GroupListeners = require("./groups");
const MovieListeners = require("./movies");

// when someone creates a new movie medium group
Emitter.on("createdGroup", GroupListeners.onCreatedGroup);
Emitter.on("addedMovie", MovieListeners.onAddedMovie);
Emitter.on("movieGotScore", MovieListeners.onMovieGotScore);
