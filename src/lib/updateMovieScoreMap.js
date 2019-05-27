const Movie = require("../movies/model.js");
const MovieScoreMap = require("../movieScoreMap/model");
const { to } = require("../../helpers/index");

module.exports = async (movieId, score) => {
  try {
    console.log("WORKING");
    let err, currMovieMap;
    [err, currMovieMap] = await to(MovieScoreMap.findOne({ id: 1 }));
    let updatedMap = currMovieMap ? { ...currMovieMap.map } : {};

    if (movieId) {
      updatedMap[movieId] = score;
    } else {
      let err, movies;
      [err, movies] = await to(Movie.find());

      for (let movie of movies) {
        if (!(movie._id in updatedMap)) {
          updatedMap[movie._id] = movie.rtScore;
        } else if (movie.rtScore !== updatedMap[movie._id]) {
          updatedMap[movie._id] = movie.rtScore;
        }
      }
    }

    if (!currMovieMap) {
      await to(MovieScoreMap.create({ map: updatedMap, id: 1 }));
    } else {
      await to(
        MovieScoreMap.findOneAndUpdate(
          { id: 1 },
          { $set: { map: updatedMap, id: 1 } }
        )
      );
    }
  } catch (e) {
    throw new Error(e);
  }
};
