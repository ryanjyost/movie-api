const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../../util/index");

const receiveMessage = catchErrors(require("./receiveMessage"));
const getCurrentUser = catchErrors(require("./getCurrentUser"));

router.post("/receive_message", receiveMessage);
router.post("/users/me", getCurrentUser);

module.exports = router;
