const { moviePredictionCutoffDate } = require("../../../../util");
const moment = require("moment");

module.exports = (movie, userMentionMessage) => {
  const daysUntilCutoff = moment
    .unix(movie.releaseDate)
    .utc()
    .diff(moment.unix(moviePredictionCutoffDate), "day");
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        `🎥 *${movie.title}*` +
        "\n" +
        `_<${movie.trailer}|Watch Trailer>_` +
        " | " +
        `_<${movie.rtLink}|View on Rotten Tomatoes>_` +
        " | " +
        `_*${daysUntilCutoff || "< 1"} days* left to predict_` +
        "\n" +
        userMentionMessage
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Make your prediction",
        emoji: true
      },
      value: `predict_movie_${movie._id}`
    }
  };
};
