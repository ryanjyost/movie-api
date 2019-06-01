const { MovieServices } = require("../../services");

module.exports = async query => {
  if (!Number(query.isClosed) && Number(query.rtScore) < 0) {
    return await MovieServices.findUpcomingMovies();
  } else if (Number(query.isClosed) && Number(query.rtScore) < 0) {
    return await MovieServices.findMoviesInPurgatory();
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) >= 0) {
    return await MovieServices.findMoviesWithScore();
  } else {
    return await MovieServices.findAllMovies();
  }
};
