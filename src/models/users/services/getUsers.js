const User = require("../model");

module.exports = async (query = {}, select = null) => {
  return await User.find(query).select(select);
};
