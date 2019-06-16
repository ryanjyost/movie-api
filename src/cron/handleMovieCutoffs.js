const {
  MovieServices,
  UserServices,
  GroupServices,
  PlatformServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;
const Emitter = require("../EventEmitter");

const { isMoviePastPredictionDeadline } = require("../util/index");
const moment = require("moment");

const handleMovieCutoffs = async () => {
  try {
    const moviesToClose = await MovieServices.findUpcomingMovies();

    for (let movie of moviesToClose) {
      if (isMoviePastPredictionDeadline(movie.releaseDate)) {
        movie.isClosed = 1;
        await movie.save();

        await UserServices.updateUserVoteMaps(movie._id);
        Emitter.emit("movieClosed", movie);
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = handleMovieCutoffs;
