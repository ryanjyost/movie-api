const express = require("express");
const router = express.Router();

// controllers
const MoviesController = require("../src/movies/controllers");

/* ======================
 Movies
========================*/

/* Get all movies */
router.get("/movies", MoviesController.getMovies);

/* Add a movie */
router.post("/movies/add", MoviesController.addMovie);

/* Edit movie */
router.post("/movies/edit/:id", MoviesController.editMovie);

/* Delete movie */
router.post("/movies/delete/:id", MoviesController.deleteMovie);

/* TODO predict movie */
router.post(
  "/movies/predict/:movieId",
  require("../controllers/MovieController").predict
);

/* ======================
 User
========================*/

/* With auth token */
router.post("/users/login", require("../controllers/UserController").login);

/* Get user info */
router.get("/users/:id", require("../controllers/UserController").getUser);

/* ======================
 GroupMe
========================*/

/* Receive a bot message */
router.post(
  "/groupme/receive_message",
  require("../lib/groupme/index").receiveMessage
);

/* Get members of a GroupMe group */
router.post(
  "/groupme/:group/users",
  require("../lib/groupme/index").getUsersInGroup
);

/*  Get groups that authorized user is a member of */
router.post(
  "/groupme/groups",
  require("../lib/groupme/index").getSingleUserGroups
);

/* Get info of current;y authorized user */
router.post("/groupme/users/me", require("../lib/groupme/index").getUser);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
