// /* make sure all users have ref to a movie with a score, to see if they get penalized for not having prediction */
// exports.updateUserVoteMaps = require("./services/updateUserVoteMaps");
//
// /* Find user based on platform data, and create one if currently none exists */
// exports.findOrCreateUser = require("./services/findOrCreateUser");
//
// /* Find MM users */
// exports.getUsers = require("./services/getUsers");
//
// /* Return MM user */
// exports.getUser = require("./services/getUser");

module.exports = {
  updateUserVoteMaps: require("./services/updateUserVoteMaps"),
  findOrCreateUser: require("./services/findOrCreateUser"),
  getUsers: require("./services/getUsers"),
  getUser: require("./services/getUser")
};
