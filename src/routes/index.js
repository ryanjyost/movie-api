const express = require("express");
const router = express.Router();
const logger = require("../../config/winston");

// Hook up routes
router.use("/groups", require("./groups"));
router.use("/movies", require("./movies"));
router.use("/users", require("./users"));
router.use("/seasons", require("./seasons"));
router.use("/admin", require("./admin"));
router.use("/groupme", require("./platforms/groupme"));

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
