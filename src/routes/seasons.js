const express = require("express");
const router = express.Router();

const { catchErrors } = require("../util/index");
const { SeasonServices } = require("../services/index");

/* With auth token */
router.get(
  "/",
  catchErrors(async (req, res) => {
    const seasons = await SeasonServices.findAllSeasons();

    res.json({ seasons });
  })
);

module.exports = router;
