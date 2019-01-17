const to = require("../lib/to.js");
const Movie = require("../models/movie.js");
const User = require("../models/user.js");
const GroupMe = require("../lib/GroupMe");
const moment = require("moment");

const add = async (req, res) => {
  let err, newMovie;

  [err, newMovie] = await to(Movie.create(req.body));

  if (err) {
    res.status(500).json(err);
  }

  let movies;
  [err, movies] = await to(Movie.find());

  if (newMovie) {
    await GroupMe.sendBotMessage(`🍿 ${newMovie.title}`);
    await GroupMe.sendBotMessage(`${newMovie.trailer}`);
  }

  res.json({ movie: newMovie, movies });
};

const edit = async (req, res) => {
  let err, movie;
  [err, movie] = await to(
    Movie.findOneAndUpdate({ _id: req.params.id }, req.body, { new: false })
  );

  if (movie.rtScore < 0 && Number(req.body.rtScore) > 0) {
    _sendResultsToGroup(movie, Number(req.body.rtScore));
  }

  let movies;
  [err, movies] = await to(Movie.find());

  res.json({ movies });
};

const _sendResultsToGroup = async (movie, score) => {
  let mainMessage = `🍿 "${
    movie.title
  }" has a Rotten Tomatoes Score of ${score}% `;
  let scoreMessage =
    `The prediction rankings for "${movie.title}" are...` + "\n";

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

const getMovies = async (req, res) => {
  let err, movies;
  let query = { ...req.query };
  let cutoffDate = moment()
    .subtract(7, "days")
    .unix();

  let mongoQuery = {};

  if ("rtScore" in query) {
    if (Number(query.rtScore) < 0) {
      mongoQuery.rtScore = { $lt: 0 };
    } else {
      mongoQuery.rtScore = { $gte: query.rtScore };
    }
  } else if ("isClosed" in query) {
    if (Number(query.isClosed) === 0) {
      mongoQuery.releaseDate = { $gt: cutoffDate };
      mongoQuery.isClosed = 0;
    } else {
      mongoQuery.releaseDate = { $lte: cutoffDate };
      mongoQuery.isClosed = 1;
    }
  }

  [err, movies] = await to(Movie.find(mongoQuery));

  if (err) {
    res.status(500).json(err);
  }

  res.json({ movies: movies });
};

module.exports = {
  add,
  edit,
  deleteMovie,
  getMovies,
  predict
};
