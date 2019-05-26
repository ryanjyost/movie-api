const User = require("../model");
const { to } = require("../../../helpers");

/*
* Get a single user's data
*/

const getUser = async (query = {}, select = null, populate = "") => {
  let err, user;
  if (populate) {
    [err, user] = await to(
      User.findOne(query)
        .populate(populate)
        .select(select)
    );
  } else {
    [err, user] = await to(User.findOne(query).select(select));
  }

  return user;
};

module.exports = getUser;
