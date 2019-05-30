const { Movies } = require("../../index");

module.exports = async (req, res, next) => {
  const movie = await Movies.getMovie({ _id: req.params.movieId });

  if (!movie) next();

  movie.votes =
    "votes" in movie
      ? {
          ...movie.votes,
          ...{ [req.body.userId]: Number(req.body.prediction) }
        }
      : { [req.body.userId]: Number(req.body.prediction) };

  await movie.save();
  next();
};
