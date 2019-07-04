const { MovieServices, UserServices } = require("../../services");
const { buildSingleUserManyMovieData } = require("../../util");

module.exports = async userId => {
  const movies = await MovieServices.findAllMovies();
  const user = await UserServices.findUserById(userId);

  return await buildSingleUserManyMovieData(user, movies);
};
