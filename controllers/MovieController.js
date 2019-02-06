const to = require("../lib/to.js");
const Movie = require("../models/movie.js");
const updateMovieScoreMap = require("../lib/updateMovieScoreMap.js");
const updateUserVoteMaps = require("../lib/updateUserVoteMaps.js");
const User = require("../models/user.js");
const moment = require("moment");

const add = async (req, res) => {
  const GroupMe = require("../lib/groupme/index.js");
  let err, newMovie;
  let newMovieData = { ...req.body };
  newMovieData.title_lower = req.body.title_lower.replace(/[^\w ]/g, "");

  [err, newMovie] = await to(Movie.create(newMovieData));

  if (err) {
    res.status(500).json(err);
  }

  let movies;
  [err, movies] = await to(Movie.find());

  if (newMovie) {
    await GroupMe.sendBotMessage(`🍿 ${newMovie.title}`);
    await GroupMe.sendBotMessage(`${newMovie.trailer}`);
  }

  await to(updateMovieScoreMap(newMovie.id, -1));

  res.json({ movie: newMovie, movies });
};

const edit = async (req, res) => {
  let err, movie;
  [err, movie] = await to(
    Movie.findOneAndUpdate({ _id: req.params.id }, req.body, { new: false })
  );

  await to(updateMovieScoreMap(req.params.id, Number(req.body.rtScore)));

  if (movie.rtScore < 0 && Number(req.body.rtScore) >= 0) {
    await to(_sendResultsToGroup(movie, Number(req.body.rtScore)));
    await to(updateUserVoteMaps(movie));
  }

  let movies;
  [err, movies] = await to(Movie.find());

  res.json({ movies });
};

const _sendResultsToGroup = async (movie, score) => {
  try {
    const GroupMe = require("../lib/groupme/index.js");
    let mainMessage = `🍿 "${
      movie.title
    }" has a Rotten Tomatoes Score of ${score}% `;
    let scoreMessage = ``;

    let votes = [];
    for (let user in movie.votes) {
      let err, userInfo;
      [err, userInfo] = await to(User.findOne({ _id: user }));
      if (userInfo && userInfo.name !== "Movie Medium") {
        votes.push({
          name: userInfo.nickname || userInfo.name,
          vote: userInfo.votes[movie._id],
          diff: userInfo.votes[movie._id] - score
        });
      }
    }

    let sorted = votes.sort((a, b) => {
      if (Math.abs(a.diff) > Math.abs(b.diff)) {
        return 1;
      } else if (Math.abs(b.diff) > Math.abs(a.diff)) {
        return -1;
      } else {
        return 0;
      }
    });

    for (let i = 0; i < sorted.length; i++) {
      let vote = sorted[i];
      scoreMessage =
        scoreMessage +
        `${i + 1}) ${vote.name}: ${vote.diff >= 0 ? "+" : "-"} ${Math.abs(
          vote.diff
        )}% (${vote.vote}% vs. ${score}%)` +
        "\n";
    }

    await GroupMe.sendBotMessage(mainMessage);
    await GroupMe.sendBotMessage(scoreMessage);
  } catch (e) {
    console.log(e);
  }
};

const deleteMovie = async (req, res) => {
  // console.log(req.params.id, req.body);

  let err, updatedMovie;
  [err, updatedMovie] = await to(Movie.deleteOne({ _id: req.params.id }));

  let movies;
  [err, movies] = await to(Movie.find());

  res.json({ movie: updatedMovie, movies });
};

const predict = async (req, res) => {
  let err, movie;
  [err, movie] = await to(Movie.findOne({ _id: req.params.movieId }));

  let user;
  [err, user] = await to(User.findOne({ _id: req.body.userId }));

  if (movie && user) {
    let updatedMovie;
    movie.votes =
      "votes" in movie
        ? { ...movie.votes, ...{ [user.id]: Number(req.body.prediction) } }
        : { [user.id]: Number(req.body.prediction) };

    await to(movie.save());

    let updatedUser;
    user.votes =
      "votes" in user
        ? { ...user.votes, ...{ [movie.id]: Number(req.body.prediction) } }
        : { [movie.id]: Number(req.body.prediction) };

    [err, updatedUser] = await to(user.save());
    res.json({ user: updatedUser });
  } else {
    res.status(500).json({ error: "No movie or user" });
  }
};

const _getMovies = async query => {
  let err, movies;
  // what day are predictions cut off
  let cutoffDate = moment()
    .add(7, "days")
    .unix();

  let mongoQuery = {};

  if (Number(query.isClosed) < 1 && Number(query.rtScore) < 0) {
    console.log("Upcoming");
    mongoQuery = {
      isClosed: 0,
      rtScore: { $lt: 0 },
      releaseDate: { $gt: cutoffDate }
    };
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) < 0) {
    console.log("Purgatory");
    mongoQuery = {
      rtScore: { $lt: 0 },
      releaseDate: { $lte: cutoffDate }
    };
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) >= 0) {
    console.log("Past");
    mongoQuery = {
      rtScore: { $gte: 0 }
      // releaseDate: { $lte: cutoffDate }
    };
  }
  [err, movies] = await to(Movie.find(mongoQuery));

  return movies;
};

const getMovies = async (req, res) => {
  let err, movies;
  let query = { ...req.query };

  [err, movies] = await to(_getMovies(query));

  if (err) {
    res.status(500).json(err);
  }

  res.json({ movies });
};

module.exports = {
  add,
  edit,
  deleteMovie,
  getMovies,
  predict
};
