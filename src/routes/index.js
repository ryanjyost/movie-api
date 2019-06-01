const express = require("express");
const router = express.Router();
const { catchErrors } = require("../util/index");
const logger = require("../../config/winston");

const getGroupPredictionData = require("./misc/getGroupPredictionData");

// Hook up routes
router.use("/groups", require("./groups"));
router.use("/movies", require("./movies"));
router.use("/users", require("./users"));
router.use("/seasons", require("./seasons"));
router.use("/admin", require("./admin"));
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
