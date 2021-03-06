const Group = require("../model.js");

module.exports = async (query = {}, populate = "") => {
  return await Group.findOne(query).populate(populate);
};
