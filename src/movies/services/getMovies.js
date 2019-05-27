const Movie = require("../model");

module.exports = async (query = {}, sort = {}) => {
  return await Movie.find(query).sort(sort);
};
