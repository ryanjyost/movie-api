const express = require("express");
const router = express.Router();

// controllers
const MoviesController = require("../src/movies/controllers");

/* ======================
 Movies
========================*/
router.get("/movies", require("../controllers/MovieController").getMovies);
router.post("/movies/add", MoviesController.addMovie);
router.post("/movies/edit/:id", require("../controllers/MovieController").edit);
router.post(
  "/movies/delete/:id",
  require("../controllers/MovieController").deleteMovie
);
router.post(
  "/movies/predict/:movieId",
  require("../controllers/MovieController").predict
);

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

/* ======================
 User
========================*/
router.post("/users/login", require("../controllers/UserController").login);
router.post("/users/groupme", require("../controllers/UserController").login);
router.get("/users/:id", require("../controllers/UserController").getUser);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
