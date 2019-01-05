const to = require("../lib/to.js");
const Movie = require("../models/movie.js");
const User = require("../models/user.js");
const GroupMe = require("../lib/GroupMe");

const add = async (req, res) => {
  let err, newMovie;

  [err, newMovie] = await to(Movie.create(req.body));

  if (err) {
    res.status(500).json(err);
  }

  if (newMovie) {
    await GroupMe.sendBotMessage(`🍿 ${newMovie.title} 🍿 ${newMovie.summary}`);
    await GroupMe.sendBotMessage(`${newMovie.trailer}`);
  }

  res.json({ movie: newMovie });
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

const getAllMovies = async (req, res) => {
  let err, movies;

  [err, movies] = await to(Movie.find());

  if (err) {
    res.status(500).json(err);
  }

  res.json({ movies: movies });
};

module.exports = {
  add,
  getAllMovies,
  predict
};
