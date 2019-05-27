const { Movies } = require("../../src");
const { moviePredictionCutoffDate } = require("../../helpers");
const moment = require("moment");

module.exports = async (req, res) => {
  let { query } = req;
  let mongoQuery = {};

  if (!Number(query.isClosed) && Number(query.rtScore) < 0) {
    // upcoming
    mongoQuery = {
      rtScore: { $lt: 0 },
      isClosed: 0
    };
  } else if (Number(query.isClosed) && Number(query.rtScore) < 0) {
    // purgatory
    mongoQuery = { rtScore: { $lt: 0 }, isClosed: 1 };
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) >= 0) {
    // past
    mongoQuery = {
      rtScore: { $gte: 0 }
    };
  }

  const movies = await Movies.getMovies(mongoQuery);

  res.json({
    movies,
    moviePredictionCutoffDate,
    currentTime: moment.utc().unix()
  });
};
