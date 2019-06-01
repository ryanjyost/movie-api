const {
  GroupServices,
  UserServices,
  MovieServices,
  MovieScoreMapServices
} = require("../../services");

const { calculateRankings } = require("../../services/shared");

module.exports = async groupId => {
  let users = [];

  if (!groupId) {
    users = await UserServices.findAllUsers();
  } else {
    const group = await GroupServices.findGroupById(groupId);
    users = group.members;
  }

  const movieScoreMap = await MovieScoreMapServices.get();
  const allMovies = await MovieServices.findAllMovies();

  return calculateRankings(users, allMovies, movieScoreMap);
};
