const Movie = require("../model");
const { to, sanitizeTitle } = require("../../../helpers");

/*
* Edit movie
*/
module.exports = async (query, update, returnNew = true) => {
  return await Movie.findOneAndUpdate(query, update, { new: returnNew });
};
