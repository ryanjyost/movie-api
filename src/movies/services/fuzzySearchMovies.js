const {
  moviePredictionCutoffDate,
  to,
  sanitizeTitle
} = require("../../../helpers");
const getMovies = require("./getMovies");
const Fuse = require("fuse.js");

/*
* Message in platform chat may not match clean title, s find best matches
*/

const fuseOptions = {
  caseSensitive: false,
  shouldSort: true,
  findAllMatches: true,
  includeScore: true,
  tokenize: true,
  keys: ["title_lower"]
};

const fuzzySearchMovies = async textToSearch => {
  let cleanTitle = sanitizeTitle(textToSearch);

  // get movies that user could possibly be predicting
  let err, movies;
  [err, movies] = await to(
    getMovies({
      isClosed: 0,
      rtScore: { $lt: 0 },
      releaseDate: { $gt: moviePredictionCutoffDate }
    })
  );

  const fuse = new Fuse(movies, fuseOptions);

  return fuse.search(cleanTitle);
};

module.exports = fuzzySearchMovies;
