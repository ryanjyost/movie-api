const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../../util/index");
const Handlers = require("../../../handlers/platforms/groupme");

const getCurrentUser = catchErrors(require("./getCurrentUser"));

router.post(
  "/receive_message",
  catchErrors(async (req, res) => {
    const reqBody = { ...req.body };

    // if it's a bot message, just ignore
    if (reqBody.sender_type === "bot") {
      res.json({ message: "No op" });
      return null;
    }

    const { text, user_id, group_id } = reqBody;
    let cleanText = text.toLowerCase().trim();

    if (
      text
        .toLowerCase()
        .replace(/ /g, "")
        .includes("moviemedium")
    ) {
      await Handlers.saveFeedback(reqBody);
    }
    if (user_id === "0") {
      await Handlers.handleGroupMeAutomatedMessage(group_id, text);
    } else if (
      cleanText === "season?" ||
      cleanText === "rankings?" ||
      cleanText === "standings?"
    ) {
      await Handlers.sendSeasonRankings(group_id);
    } else if (cleanText === "overall?") {
      await Handlers.sendGroupRankings(group_id);
    } else if (text.includes("=") || text.includes("-")) {
      await Handlers.handleUserPredictionOnPlatform(reqBody);
    }

    // await Handlers.receiveMessage(reqBody);

    res.json({ message: "No op" });
  })
);
router.post("/users/me", getCurrentUser);

module.exports = router;
