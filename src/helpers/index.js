const moment = require("moment");

/*
* HELPER FUNCTIONS
*/

/* Catch errors in awaited functions */
exports.to = promise => {
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

/* Make easier searching/matching */
exports.sanitizeTitle = text => text.toLowerCase().replace(/[^\w ]/g, "");

const moviePredictionCutoffDate = moment()
  .endOf("day")
  .add(7, "days")
  .unix();
exports.moviePredictionCutoffDate = moviePredictionCutoffDate;

exports.isMoviePastPredictionDeadline = releaseTimestamp => {
  return moment.unix(releaseTimestamp).isBefore(moviePredictionCutoffDate);
};
