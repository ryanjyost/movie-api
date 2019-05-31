const { Movies } = require("../../src");

module.exports = async (req, res) => {
  await Movies.deleteMovie(req.params.id);

  const movies = await Movies.getMovies();

  res.json({ movies });
};
