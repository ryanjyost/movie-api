const express = require("express");
const router = express.Router();
const moment = require("moment");

const { catchErrors, moviePredictionCutoffDate } = require("../../util");

const Handlers = require("../../handlers/movies");

const addMovie = catchErrors(require("./addMovie"));
const editMovie = catchErrors(require("./editMovie"));
const deleteMovie = catchErrors(require("./deleteMovie"));
const updateMovieVotes = catchErrors(require("./updateMovieVotes"));
const updateUserPrediction = catchErrors(
  require("../users/updateUserPrediction")
);

/* Get all movies */
router.get("/", async (req, res) => {
  const { query } = req;

  const movies = await Handlers.getMovies(query);
  res.json({
    movies,
    moviePredictionCutoffDate,
    currentTime: moment.utc().unix()
  });
});

/* Add a movie */
router.post("/add", addMovie);

/* Edit movie */
router.post("/edit/:id", editMovie);

/* Delete movie */
router.post("/delete/:id", deleteMovie);

/* Update a user's movie prediction */
router.post("/predict/:movieId", updateMovieVotes, updateUserPrediction);

module.exports = router;
