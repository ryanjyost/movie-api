const Movie = require("../model");
const { to, moviePredictionCutoffDate } = require("../../helpers");
const GroupMe = require("../../platforms/groupme");

// big operations
const updateMovieScoreMap = require("../../lib/updateMovieScoreMap");
const sendMovieScoreResultsToAllGroups = require("../../lib/sendMovieScoreResultsToAllGroups");

// Movie services
const addMovie = require("../services/addMovie");
const getMovies = require("../services/getMovies");

// User services
const { updateUserVoteMaps } = require("../../users");

/*
* Get Movies
*/
exports.getMovies = async (req, res, next) => {
  let query = req.query;
  let mongoQuery = {};

  if (!Number(query.isClosed) && Number(query.rtScore) < 0) {
    mongoQuery = {
      rtScore: { $lt: 0 },
      releaseDate: { $gt: moviePredictionCutoffDate }
    };
  } else if (Number(query.isClosed) && Number(query.rtScore) < 0) {
    mongoQuery = {
      rtScore: { $lt: 0 },
      releaseDate: { $lte: moviePredictionCutoffDate }
    };
  } else if (Number(query.isClosed) > 0 && Number(query.rtScore) >= 0) {
    mongoQuery = {
      rtScore: { $gte: 0 }
    };
  }

  let err, movies;
  [err, movies] = await to(getMovies(mongoQuery));
  if (err) next(err);

  res.json({ movies });
};

/*
* ADD MOVIE TO THE DB
*/
exports.addMovie = async (req, res, next) => {
  const newMovieData = req.body;

  //... add new movie to the db
  let err, newMovie;
  [err, newMovie] = await to(addMovie(newMovieData));
  if (err) next(err);

  //...let groups know that a movie was added
  let response;
  if (newMovie) {
    [err, response] = await to(GroupMe.sendBotMessage(`🍿 ${newMovie.title}`));
    [err, response] = await to(GroupMe.sendBotMessage(`${newMovie.trailer}`));

    //...record that we have a new movie without a RT score yet
    await to(updateMovieScoreMap(newMovie.id, -1));
    if (err) next(err);
  }

  // return all movies to make updating admin easier
  let movies;
  [err, movies] = await to(Movie.find());
  if (err) next(err);

  res.json({ movie: newMovie, movies });
};

/*
* EDIT MOVIE
*/
exports.editMovie = async (req, res, next) => {
  let err, movieBeforeUpdate;
  [err, movieBeforeUpdate] = await to(
    Movie.findOneAndUpdate({ _id: req.params.id }, req.body, { new: false })
  );
  if (err) next(err);

  await to(updateMovieScoreMap(req.params.id, Number(req.body.rtScore)));

  if (movieBeforeUpdate.rtScore < 0 && Number(req.body.rtScore) >= 0) {
    [err, response] = await to(updateUserVoteMaps(movieBeforeUpdate));
    if (err) next(err);

    [err, response] = await to(
      sendMovieScoreResultsToAllGroups(
        movieBeforeUpdate,
        Number(req.body.rtScore)
      )
    );
    if (err) next(err);
  }

  // return all movies to make updating admin easier
  let movies;
  [err, movies] = await to(Movie.find());
  if (err) next(err);

  res.json({ movies });
};

/*
* DELETE MOVIE
*/
exports.deleteMovie = async (req, res, next) => {
  let err, deletedMovie;
  [err, deletedMovie] = await to(Movie.deleteOne({ _id: req.params.id }));
  if (err) next(err);

  let movies;
  [err, movies] = await to(Movie.find());
  if (err) next(err);

  res.json({ movies });
};

/*
* Handle user prediction
*/
exports.handleUserPrediction = async (req, res, next) => {
  let err, movie;
  [err, movie] = await to(Movie.findOne({ _id: req.params.movieId }));
  if (err || !movie) next(err);

  movie.votes =
    "votes" in movie
      ? {
          ...movie.votes,
          ...{ [req.body.userId]: Number(req.body.prediction) }
        }
      : { [req.body.userId]: Number(req.body.prediction) };

  await to(movie.save());
  next();
};
