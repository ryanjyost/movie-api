const User = require("../model");

/*
* Get a single user's data
*/

module.exports = async (query = {}, select = null, populate = "") => {
  let user;
  if (populate) {
    return await User.findOne(query)
      .populate(populate)
      .select(select);
  } else {
    return await User.findOne(query).select(select);
  }
};
