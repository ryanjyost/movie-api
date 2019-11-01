const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");
const fs = require("fs");
const readline = require("readline");

const Handler = require("../handlers/admin");
const {
  FeedbackServices,
  UserServices,
  GroupServices
} = require("../services");
const handleCutoffNotifications = require("../cron/handleCutoffNotifications");
const Emitter = require("../EventEmitter");

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

router.get(
  "/logs",
  catchErrors(async (req, res) => {
    let logs = [];
    const rd = readline.createInterface({
      input: fs.createReadStream("logs/app.log")
    });

    rd.on("line", function(line) {
      logs.push(JSON.parse(line));
    });
    rd.on("close", function(d) {
      res.json({
        logs
      });
    });
  })
);

router.get(
  "/feedback",
  catchErrors(async (req, res) => {
    const feedback = await FeedbackServices.findAllFeedback();
    const users = await UserServices.findAllUsers();
    const groups = await GroupServices.findAllGroups();

    const filteredUsers = users.filter(u => u.groups.length);

    res.json({
      feedback,
      stats: {
        users: filteredUsers.length,
        groups: groups.length
      }
    });
  })
);

router.post(
  "/feedback/:id/respond",
  catchErrors(async (req, res) => {
    const { message } = req.body;
    const { id } = req.params;

    const updatedFeedback = await Handler.handleFeedbackResponse(id, message);
    res.json({ response: updatedFeedback });
  })
);

router.post(
  "/send_warning/:movieId",
  catchErrors(async (req, res) => {
    const { movieId } = req.params;
    await handleCutoffNotifications(movieId);
    res.status(200).send();
  })
);

module.exports = router;
