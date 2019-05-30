const express = require("express");
const router = express.Router();
const { catchErrors } = require("../util/index");

const getGroupPredictionData = require("./misc/getGroupPredictionData");

// Hook up routes
router.use("/groups", require("./groups/index"));
router.use("/movies", require("./movies/index"));
router.use("/users", require("./users/index"));
router.use("/seasons", require("./seasons/index"));
router.use("/groupme", require("./platforms/groupme/index"));

/* Misc stuff */
router.get(
  "/group_breakdowns/:groupId/:type",
  catchErrors(getGroupPredictionData)
);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
