const { Movies } = require("../../index");

module.exports = async (req, res) => {
  await Movies.deleteMovie(req.params.id);

  const movies = await Movies.getMovies();

  res.json({ movies });
};
