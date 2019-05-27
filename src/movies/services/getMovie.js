const Movie = require("../model");

module.exports = async (query = {}, sort = {}) => {
  return await Movie.findOne(query).sort(sort);
};
