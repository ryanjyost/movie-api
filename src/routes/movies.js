const express = require("express");
const router = express.Router();
const moment = require("moment");

const { catchErrors, moviePredictionCutoffDate } = require("../util/index");

const { MovieServices } = require("../services/index");
const Handlers = require("../handlers/movies/index");

/* Get all movies */
router.get(
  "/",
  catchErrors(async (req, res) => {
    const { query } = req;

    const movies = await Handlers.getMovies(query);
    res.json({
      movies,
      moviePredictionCutoffDate,
      currentTime: moment.utc().unix()
    });
  })
);

/* Add a movie */
router.post(
  "/add",
  catchErrors(async (req, res) => {
    const newMovieData = { ...req.body };

    const { newMovie, movies } = await Handlers.addMovie(newMovieData);

    res.json({ movie: newMovie, movies });
  })
);

/* Edit movie */
router.post(
  "/edit/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const updatedData = { ...req.body };

    const movies = await Handlers.editMovie(id, updatedData);

    res.json({ movies });
  })
);

/* Delete movie */
router.post(
  "/delete/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    await MovieServices.deleteMovie(id);

    const movies = MovieServices.findAllMovies();

    res.json({ movies });
  })
);

module.exports = router;
