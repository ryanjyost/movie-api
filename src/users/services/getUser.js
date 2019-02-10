const User = require("../model");
const { to } = require("../../helpers");

/*
* Get a single user's data
*/

const getUser = async userId => {
  let existingUser;
  [err, existingUser] = await to(
    User.findOne({
      _id: userId
    })
  );

  return existingUser;
};

module.exports = getUser;
