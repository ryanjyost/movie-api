const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../helpers");

const login = catchErrors(require("./login"));
const getUser = catchErrors(require("./getUser"));

/* With auth token */
router.post("/login", login);
router.get("/:id", getUser);

module.exports = router;
