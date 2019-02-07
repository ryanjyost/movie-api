const addMovie = async newMovieData => {
  const GroupMe = require("../lib/groupme/index.js");
  let err, newMovie;
  newMovieData.title_lower = newMovieData.title_lower.replace(/[^\w ]/g, "");

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
};

exports = addMovie;
