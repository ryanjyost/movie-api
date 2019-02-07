const MovieServices = require("./");
const { to } = require("../../../helpers");

exports.addMovie = async (req, res, next) => {
  const newMovieData = req.body;

  //... add new movie to the db
  let err, newMovie;
  [err, newMovie] = await to(MovieServices.addMovie(newMovieData));
  if (err) next(err);

  // let err = new Error("This is a test error");
  // next(err);

  res.json({ movie: newMovie, movies });
};
