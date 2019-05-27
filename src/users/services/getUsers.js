const User = require("../model");
const { to } = require("../../../helpers");

module.exports = async (query = {}, select = null) => {
  return await to(User.find(query).select(select));
};
