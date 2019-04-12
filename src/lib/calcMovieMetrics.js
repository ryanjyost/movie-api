const Movie = require("../movies/model.js");
const MovieScoreMap = require("../../models/movieScoreMap.js");
const { to } = require("../helpers/index");

module.exports = async () => {
  let err, movies;
  [err, movies] = await to(Movie.find());

  for (let movie of movies) {
    let average = -1,
      numVotes = 0,
      total = 0,
      high = -1,
      low = -1;
    if (movie.votes && movie.rtScore >= 0) {
      for (let user in movie.votes) {
        if (movie.votes[user] >= 0) {
          numVotes++;
          const diff = Math.abs(movie.votes[user] - movie.rtScore);
          total = total + diff;

          high = diff > high ? diff : high;
          low = diff < low ? diff : low;
        }
      }
      average = Math.round(total / numVotes);
    } else {
      average = -1;
    }

    movie.metrics = { average, high, low };
    movie.save();
  }
};

const calculateSingleMovieMetrics = movie => {};
