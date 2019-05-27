const Movie = require("../model");

module.exports = async id => {
  return await Movie.deleteOne({ _id: id });
};
