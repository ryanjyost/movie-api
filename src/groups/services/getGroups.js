const Group = require("../model.js");

module.exports = async (query = {}, populate = "") => {
  return await to(Group.find(query).populate(populate));
};
