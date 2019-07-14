const moment = require("moment");
const mongoose = require("mongoose");
const MovieScoreMap = require("../models/movieScoreMap/model");
const _ = require("lodash");
const logger = require("../../config/winston");

/*
* HELPER FUNCTIONS
*/

/* Make easier searching/matching */
exports.sanitizeTitle = text => text.toLowerCase().replace(/[^\w ]/g, "");

// what release date does movie need to have to be cutoff to further predictions
const moviePredictionCutoffDate = moment
  .utc()
  .endOf("day")
  .add(14, "days")
  .unix();
exports.moviePredictionCutoffDate = moviePredictionCutoffDate;

exports.isMoviePastPredictionDeadline = releaseTimestamp => {
  return moment
    .unix(releaseTimestamp)
    .utc()
    .isBefore(moment.unix(moviePredictionCutoffDate).utc());
};

/* convert string to object id */
exports.createObjectId = stringId => mongoose.Types.ObjectId(stringId);

/* Retrieve object of movie ids mapped to rt scores */
exports.getMovieScoreMap = async () => {
  let err, movieScoreMap;
  [err, movieScoreMap] = await to(MovieScoreMap.findOne({ id: 1 }));
  if (err) throw new Error();

  return movieScoreMap.map;
};

/* Sort array */
exports.sortArrayByProperty = (array, property, asc = false) => {
  return array.sort((a, b) => {
    a = _.get(a, property);
    b = _.get(b, property);

    if (a > b) {
      return asc ? 1 : -1;
    } else if (b > a) {
      return asc ? -1 : 1;
    } else {
      return 0;
    }
  });
};

/* Calc movie penalty */
exports.calcNoPredictionPenalty = movie => {
  if (movie.metrics) {
    return Math.abs(
      Math.ceil(
        Math.min(
          100,
          Math.max(movie.metrics.high * 1.1, Math.abs(movie.metrics.high) + 1)
        )
      )
    );
  } else {
    return 0;
  }
};

exports.emojiMap = [`🥇`, `🥈`, `🥉`];
exports.catchErrors = require("./catchErrors");
exports.calcGroupRankingsForSingleMovie = require("./calcGroupRankingsForSingleMovie");
exports.buildSingleUserSingleMovieData = require("./buildSingleUserSingleMovieData");
exports.buildSingleUserManyMovieData = require("./buildSingleUserManyMovieData");
exports.to = require("./handleApi");
exports.logger = logger;
exports.messages = require("./messages");
