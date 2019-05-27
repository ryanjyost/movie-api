const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../helpers");

const getMovies = catchErrors(require("./getMovies"));
const addMovie = catchErrors(require("./addMovie"));
const editMovie = catchErrors(require("./editMovie"));
const deleteMovie = catchErrors(require("./deleteMovie"));
const updateMovieVotes = catchErrors(require("./updateMovieVotes"));
const updateUserPrediction = catchErrors(
  require("../users/updateUserPrediction")
);

/* Get all movies */
router.get("/", getMovies);

/* Add a movie */
router.post("/add", addMovie);

/* Edit movie */
router.post("/edit/:id", editMovie);

/* Delete movie */
router.post("/delete/:id", deleteMovie);

/* Update a user's movie prediction */
router.post("/predict/:movieId", updateMovieVotes, updateUserPrediction);

module.exports = router;
