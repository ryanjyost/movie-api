const User = require("../model");
const { to } = require("../../helpers");

/*
* Get users
*/

const getUsers = async (query = {}, select = null) => {
  let err, users;
  [err, users] = await to(User.find(query).select(select));
  return users;
};

module.exports = getUsers;
