const express = require("express");
const router = express.Router();

// controllers
const MoviesController = require("../src/movies/controllers");
const UsersController = require("../src/users/controllers");
const GroupsController = require("../src/groups/controllers");
const GroupMeController = require("../src/platforms/groupme/controllers");

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

/* Update a user's movie prediction */
router.post(
  "/movies/predict/:movieId",
  MoviesController.handleUserPrediction,
  UsersController.updateUserPrediction
);

/* ======================
 User
========================*/

/* With auth token */
router.post("/users/login", UsersController.login);

/* Get user info */
router.get("/users/:id", UsersController.getUser);

/* ======================
 Groups
========================*/

/* Get group info */
router.get("/groups/:id", GroupsController.getGroup);

/* ======================
 GroupMe
========================*/

/* Receive a bot message */
router.post("/groupme/receive_message", GroupMeController.receiveMessage);

/* Get info on GroupMe group */
router.post("/groupme/:group/users", GroupMeController.getGroup);

/*  Get groups that authorized user is a member of */
router.post("/groupme/groups", GroupMeController.getCurrentUsersGroups);

/* Get info of currently authorized user */
router.post("/groupme/users/me", GroupMeController.getUser);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
