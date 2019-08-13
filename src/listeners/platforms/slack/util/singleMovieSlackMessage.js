const { moviePredictionCutoffDate } = require("../../../../util");
const moment = require("moment");

module.exports = (movie, userMentionMessage) => {
  const daysUntilCutoff = moment
    .unix(movie.releaseDate)
    .utc()
    .diff(moment.unix(moviePredictionCutoffDate), "day");

  if (!movie.poster) {
    return [
      {
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
            (userMentionMessage || "")
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
      }
    ];
  }
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🎥 *${movie.title}*`
        // "\n" +
        // `_<${movie.trailer}|Watch Trailer>_` +
        // " | " +
        // `_<${movie.rtLink}|View on Rotten Tomatoes>_` +
        // " | " +
        // `_*${daysUntilCutoff || "< 1"} days* left to predict_` +
        // "\n" +
        // (userMentionMessage || "")
      },
      // accessory: {
      //   type: "image",
      //   image_url: `https://mm-posters.s3.amazonaws.com/${movie.poster}`,
      //   alt_text: "movie poster"
      // }
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Make your prediction",
          emoji: true
        },
        value: `predict_movie_${movie._id}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `_*${daysUntilCutoff || "< 1"} days* left to predict_` +
          "\n" +
          `_<${movie.trailer}|Watch Trailer>_` +
          "\n" +
          `_<${movie.rtLink}|View on Rotten Tomatoes>_` +
          "\n" +
          (userMentionMessage || "")
      },
      accessory: {
        type: "image",
        image_url: `https://mm-posters.s3.amazonaws.com/${movie.poster}`,
        alt_text: "movie poster"
      }
      // accessory: {
      //   type: "button",
      //   text: {
      //     type: "plain_text",
      //     text: "Make your prediction",
      //     emoji: true
      //   },
      //   value: `predict_movie_${movie._id}`
      // }
    },
    // {
    //   type: "context",
    //   elements: [
    //     {
    //       type: "button",
    //       text: {
    //         type: "plain_text",
    //         text: "Make your prediction",
    //         emoji: true
    //       },
    //       style: "primary",
    //       value: `predict_movie_${movie._id}`
    //     }
    //   ]
    // },
    {
      type: "divider"
    }
  ];
};
