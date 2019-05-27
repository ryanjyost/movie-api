const express = require("express");
const router = express.Router();

const getGroupPredictionData = require("./misc/getGroupPredictionData");

// Hook up routes
router.use("/groups", require("./groups"));
router.use("/movies", require("./movies"));
router.use("/users", require("./users"));
router.use("/seasons", require("./seasons"));
router.use("/groupme", require("./platforms/groupme"));

/* Misc stuff */
router.get("/group_breakdowns/:groupId/:type", getGroupPredictionData);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
