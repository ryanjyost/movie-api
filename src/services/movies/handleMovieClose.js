const { Users } = require("../../models");
const Emitter = require("../../EventEmitter");

module.exports = async movie => {
  await Users.updateUserVoteMaps(movie._id);

  Emitter.emit("movieClosed", movie);
};
