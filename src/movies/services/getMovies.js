const Movie = require("../model");
const { moviePredictionCutoffDate, to } = require("../../../helpers");

module.exports = async (query = {}, sort = {}) => {
  let err, movies;

  [err, movies] = await to(Movie.find(query).sort(sort));

  return movies;
};
