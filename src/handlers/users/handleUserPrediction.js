const { UserServices, MovieServices } = require("../../services");
const Boom = require("@hapi/boom");

module.exports = async (userId, movieId, prediction) => {
  const updatedUser = await UserServices.updateUserPrediction(
    userId,
    movieId,
    prediction
  );

  if (!updatedUser)
    throw Boom.badImplementation("Something went wrong updated user");

  const updatedMovie = await MovieServices.updateMovieVotes(
    userId,
    movieId,
    prediction
  );

  return updatedUser;
};
