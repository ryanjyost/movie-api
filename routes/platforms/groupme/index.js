const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../../helpers");

const receiveMessage = catchErrors(require("./receiveMessage"));

router.post("/receive_message", receiveMessage);

module.exports = router;
