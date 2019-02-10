const Movie = require("./model");

/* Add new movie to the DB */
exports.addMovie = require("./services/addMovie");

/* Return any movies matching query */
exports.getMovies = require("./services/getMovies");

/* Return MM user */
exports.getMovie = (query = {}) => {
  return Movie.findOne(query);
};
