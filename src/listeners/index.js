const Emitter = require("../EventEmitter");
const GroupListeners = require("./groups");

Emitter.on("createdGroup", GroupListeners.onCreatedGroup);
