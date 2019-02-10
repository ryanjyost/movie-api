const User = require("./model");

/* make sure all users have ref to a movie with a score, to see if they get penalized for not having prediction */
exports.updateUserVoteMaps = require("./services/updateUserVoteMaps");

/* Find user based on platform data, and create one if currently none exists */
exports.findOrCreateUser = require("./services/findOrCreateUser");

/* Return MM user */
exports.getUser = (query = {}) => {
  return User.findOne(query);
};
