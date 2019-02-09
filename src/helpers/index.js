const moment = require("moment");

/*
* HELPER FUNCTIONS
*/

/* Catch errors in awaited functions */
exports.to = promise => {
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => [err]);
};

/* Make easier searching/matching */
exports.sanitizeTitle = text => text.toLowerCase().replace(/[^\w ]/g, "");

exports.moviePredictionCutoffDate = moment()
  .add(7, "days")
  .unix();
