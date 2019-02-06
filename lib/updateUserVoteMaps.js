/*
* When a movie gets an RT score, we want to make sure every user
* has a reference to that movie in their "votes" map.
*
* If they haven't prediced already, we
*
 */

const User = require("../models/user.js");
const to = require("./to.js");

module.exports = async newMovie => {
  try {
    console.log("UPDATE USER VOTE MAPS", newMovie);
    let err, result;
    [err, result] = await to(
      User.update(
        { [`votes.${newMovie._id}`]: { $exists: false } },
        { $set: { [`votes.${newMovie._id}`]: -1 } },
        { multi: true }
      )
    );
  } catch (e) {
    console.log(e);
  }
};
