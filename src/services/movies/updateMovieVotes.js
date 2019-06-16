const { Movies } = require("../../models");
const Boom = require("@hapi/boom");

module.exports = async (userId, movieId, prediction) => {
  const movie = await Movies.findMovieById(movieId);

  if (!movie)
    throw Boom.badImplementation("Something went wrong updating movie");

  movie.votes =
    "votes" in movie
      ? {
          ...movie.votes,
          ...{ [userId]: Number(prediction) }
        }
      : { [userId]: Number(prediction) };

  return await movie.save();
};
