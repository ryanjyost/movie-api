const Movie = require("../model");
const { moviePredictionCutoffDate, to } = require("../../../helpers");

module.exports = async (query = {}, sort = {}) => {
  return await to(Movie.find(query).sort(sort));
};
