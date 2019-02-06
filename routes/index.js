const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post(
  "/groupme/receive_message",
  require("../lib/groupme/index").receiveMessage
);
router.post(
  "/groupme/:group/users",
  require("../lib/groupme/index").getUsersInGroup
);
router.post(
  "/groupme/groups",
  require("../lib/groupme/index").getSingleUserGroups
);
router.post("/groupme/users/me", require("../lib/groupme/index").getUser);

router.post("/users/login", require("../controllers/UserController").login);
router.post("/users/groupme", require("../controllers/UserController").login);
router.get("/users/:id", require("../controllers/UserController").getUser);

router.get("/movies", require("../controllers/MovieController").getMovies);
router.post("/movies/add", require("../controllers/MovieController").add);
router.post("/movies/edit/:id", require("../controllers/MovieController").edit);
router.post(
  "/movies/delete/:id",
  require("../controllers/MovieController").deleteMovie
);
router.post(
  "/movies/predict/:movieId",
  require("../controllers/MovieController").predict
);

module.exports = router;
