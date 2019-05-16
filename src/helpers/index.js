const moment = require("moment");
const mongoose = require("mongoose");
const MovieScoreMap = require("../../models/movieScoreMap");
const _ = require("lodash");

/*
* HELPER FUNCTIONS
*/

/* Catch errors in awaited functions */
const to = promise => {
  return promise
    .then(data => {
      if (!data) {
        return [null, data];
      }

      // handle axios response

      if ("ok" in data) {
        if (data.ok) {
          return [null, data.data ? data.data.response : data.data];
        } else {
          return [data, null];
        }
      } else {
        return [null, data];
      }
    })
    .catch(err => [err]);
};
exports.to = to;

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
  return moment.unix(releaseTimestamp).isBefore(moviePredictionCutoffDate);
};

/* convert string to object id */
exports.createObjectId = stringId => mongoose.Types.ObjectId(stringId);

/* Retrieve object of movie ids mapped to rt scores */
exports.getMovieScoreMap = async () => {
  let movieScoreMap;
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
    return Math.abs(Math.ceil(Math.min(100, movie.metrics.high * 1.1)));
  } else {
    return 0;
  }
};
