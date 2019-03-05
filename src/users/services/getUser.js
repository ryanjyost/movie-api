const User = require("../model");
const { to } = require("../../helpers");

/*
* Get a single user's data
*/

const getUser = async (query = {}, select = null, populate = null) => {
  let err, user;
  [err, user] = await to(
    User.findOne(query)
      .populate(populate)
      .select(select)
  );
  return user;
};

module.exports = getUser;
