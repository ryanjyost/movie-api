const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");
const Handler = require("../handlers/admin");

const { catchErrors } = require("../util/index");

router.post(
  "/message/all",
  catchErrors(async (req, res) => {
    const { message } = req.body;
    const result = await Handler.sendMessageToAllGroups(message);

    if (!result)
      throw Boom.badImplementation("Error sending message to all groups");

    res.json({ message: "success" });
  })
);

router.get("/logs", async (req, res) => {});

module.exports = router;
