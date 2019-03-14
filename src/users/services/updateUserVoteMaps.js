/*
* When a movie gets an RT score, we want to make sure every user
* has a reference to that movie in their "votes" map in order
* to easily calculate stadard deviations, create rankings, etc.
*
* If they haven't predicted already, we set as -1
*
 */

const User = require("../model");
const { to } = require("../../helpers");

module.exports = async movie => {
  try {
    // this updates any user that hasn't predicted with a placeholder of -1
    let err, result;
    [err, result] = await to(
      User.update(
        { [`votes.${movie._id}`]: { $exists: false } },
        { $set: { [`votes.${movie._id}`]: -1 } },
        { multi: true }
      )
    );

    return result;
  } catch (e) {
    return e;
  }
};
