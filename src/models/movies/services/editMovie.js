const Movie = require("../model");

module.exports = async (query, update, returnNew = true) => {
  return await Movie.findOneAndUpdate(query, update, { new: returnNew });
};
