const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../helpers");

const getSeasons = catchErrors(require("./getSeasons"));

/* With auth token */
router.get("/", getSeasons);

module.exports = router;
