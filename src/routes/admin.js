const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");
const Handler = require("../handlers/admin");
const fs = require("fs");
const readline = require("readline");

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

router.get("/logs", async (req, res) => {
  let logs = [];
  const rd = readline.createInterface({
    input: fs.createReadStream("logs/app.log")
  });

  rd.on("line", function(line) {
    logs.push(JSON.parse(line));
  });
  rd.on("close", function(d) {
    res.json({ logs });
  });
});

module.exports = router;
