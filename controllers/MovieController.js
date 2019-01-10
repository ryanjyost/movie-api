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
    await GroupMe.sendBotMessage(`🍿 ${newMovie.title} 🍿 ${newMovie.summary}`);
    await GroupMe.sendBotMessage(`${newMovie.trailer}`);
  }

  res.json({ movie: newMovie, movies });
};

const edit = async (req, res) => {
  // console.log(req.params.id, req.body);

  let err, updatedMovie;
  [err, updatedMovie] = await to(
    Movie.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
  );

  let movies;
  [err, movies] = await to(Movie.find());

  console.log("UPDATED", updatedMovie);

  res.json({ movie: updatedMovie, movies });
};

const deleteMovie = async (req, res) => {
  // console.log(req.params.id, req.body);

  let err, updatedMovie;
  [err, updatedMovie] = await to(Movie.deleteOne({ _id: req.params.id }));

  let movies;
  [err, movies] = await to(Movie.find());

  console.log("UPDATED", updatedMovie);

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

  if ("isClosed" in query) {
    query.isClosed = Number(query.isClosed);
    if (Number(query.isClosed) === 0) {
      query.releaseDate = { $gte: moment().unix() };
    }
  }

  if ("rtScore" in query) {
    if (Number(query.rtScore) < 0) {
      query.rtScore = { $lt: 0 };
    } else {
      query.rtScore = { $gte: query.rtScore };
    }
  }

  [err, movies] = await to(Movie.find(query));

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
