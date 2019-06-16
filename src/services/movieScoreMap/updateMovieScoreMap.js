const { MovieScoreMap, Movies } = require("../../models");
const Boom = require("@hapi/boom");

module.exports = async (movieId, score) => {
  const currMovieMap = await MovieScoreMap.get();
  let updatedMap = currMovieMap ? { ...currMovieMap.map } : {};

  if (!movieId) {
    throw Boom.badImplementation(
      "Need a movie id to update the movie score map"
    );
  }

  updatedMap[movieId] = score;

  return await MovieScoreMap.update(updatedMap);
};
