/*
* When a movie gets an RT score, we want to make sure every user
* has a reference to that movie in their "votes" map in order
* to easily calculate stadard deviations, create rankings, etc.
*
* If they haven't predicted already, we set as -1
*
 */

const User = require("../../models/model.js");
const { to } = require("../helpers/index");

module.exports = async newMovie => {
  console.log("UPDATE USER VOTE MAPS", newMovie);
  // this updates any user that hasn't predicted with a placeholder of -1
  let err, result;
  [err, result] = await to(
    User.update(
      { [`votes.${newMovie._id}`]: { $exists: false } },
      { $set: { [`votes.${newMovie._id}`]: -1 } },
      { multi: true }
    )
  );
};
