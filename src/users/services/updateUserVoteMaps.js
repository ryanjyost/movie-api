/*
* When a movie gets an RT score, we want to make sure every user
* has a reference to that movie in their "votes" map in order
* to easily calculate stadard deviations, create rankings, etc.
*
* If they haven't predicted already, we set as -1
*
 */

const User = require("../model");

module.exports = async movie => {
  // this updates any user that hasn't predicted with a placeholder of -1
  return await User.update(
    { [`votes.${movie._id}`]: { $exists: false } },
    { $set: { [`votes.${movie._id}`]: -1 } },
    { multi: true }
  );
};
