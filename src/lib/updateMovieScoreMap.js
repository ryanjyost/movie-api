const Movie = require("../movies/model.js");
const MovieScoreMap = require("../movieScoreMap/model");

module.exports = async (movieId, score) => {
  const currMovieMap = await MovieScoreMap.findOne({ id: 1 });
  let updatedMap = currMovieMap ? { ...currMovieMap.map } : {};

  if (movieId) {
    updatedMap[movieId] = score;
  } else {
    const movies = await Movie.find();

    for (let movie of movies) {
      if (!(movie._id in updatedMap)) {
        updatedMap[movie._id] = movie.rtScore;
      } else if (movie.rtScore !== updatedMap[movie._id]) {
        updatedMap[movie._id] = movie.rtScore;
      }
    }
  }

  if (!currMovieMap) {
    await MovieScoreMap.create({ map: updatedMap, id: 1 });
  } else {
    await MovieScoreMap.findOneAndUpdate(
      { id: 1 },
      { $set: { map: updatedMap, id: 1 } }
    );
  }
};
