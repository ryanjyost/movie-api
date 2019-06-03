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
  findMovieById: async id => {
    return await Movie.findOne({ _id: id });
  },
  findMovieByCleanTitle: async cleanTitle => {
    return await Movie.findOne({ title_lower: cleanTitle });
  },
  addMovie: async newMovieData => {
    return await Movie.create(newMovieData);
  },
  editMovie: async (id, updatedData, returnNew) => {
    return await Movie.findOneAndUpdate({ _id: id }, updatedData, {
      new: returnNew
    });
  },
  deleteMovie: async id => {
    return await Movie.deleteOne({ _id: id });
  }
};
