const { Users } = require("../../models");
const Emitter = require("../../EventEmitter");

module.exports = async movie => {
  await Users.updateUserVoteMaps(movie);

  Emitter.emit("movieClosed", movie);
};
