const Movie = require("./model");

module.exports = {
  findUpcomingMovies: async () => {
    return await Movie.find({
      rtScore: { $lt: 0 },
      isClosed: 0
    }).sort({ releaseDate: 1 });
  },
  findAllMovies: async () => {
    return await Movie.find();
  },
  findMoviesInPurgatory: async () => {
    return await Movie.find({ rtScore: { $lt: 0 }, isClosed: 1 });
  },
  findMoviesWithScore: async () => {
    return await Movie.find({ rtScore: { $gte: 0 } });
  },
  findMoviesBySeason: async seasonId => {
    return await Movie.find({ season: seasonId });
  },
  addMovie: require("./services/addMovie"),
  deleteMovie: require("./services/deleteMovie"),
  editMovie: require("./services/editMovie"),
  getMovies: require("./services/getMovies"),
  getMovie: require("./services/getMovie"),
  fuzzySearchMovies: require("./services/fuzzySearchMovies")
};
