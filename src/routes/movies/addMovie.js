const { GroupMe, Movies, Groups, Lib } = require("../../index");

module.exports = async (req, res) => {
  const newMovieData = req.body;

  //... add new movie to the db
  const newMovie = await Movies.addMovie(newMovieData);

  //...let groups know that a movie was added
  if (newMovie) {
    const groups = await Groups.getGroups();

    for (let group of groups) {
      await GroupMe.sendBotMessage(`🎥 ${newMovie.title}`, group.bot.bot_id);
      await GroupMe.sendBotMessage(`${newMovie.trailer}`, group.bot.bot_id);
    }

    //...record that we have a new movie without a RT score yet
    await Lib.updateMovieScoreMap(newMovie.id, -1);
  }

  // return all movies to make updating admin easier
  const movies = await Movies.getMovies();

  res.json({ movie: newMovie, movies });
};
