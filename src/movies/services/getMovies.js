const Movie = require("../model");
const { moviePredictionCutoffDate, to } = require("../../helpers");

const getMovies = async query => {
  let err, movies;

  let mongoQuery = {};

  if (!Number(query.isClosed) && Number(query.rtScore) < 0) {
    mongoQuery = {
      rtScore: { $lt: 0 },
      releaseDate: { $gt: moviePredictionCutoffDate }
    };
  } else if (Number(query.isClosed) && Number(query.rtScore) < 0) {
    mongoQuery = {
      rtScore: { $lt: 0 },
      releaseDate: { $lte: moviePredictionCutoffDate }
    };
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) >= 0) {
    mongoQuery = {
      rtScore: { $gte: 0 }
    };
  }
  [err, movies] = await to(Movie.find(mongoQuery));

  return movies;
};

module.exports = getMovies;
