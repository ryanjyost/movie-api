const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");

const { catchErrors } = require("../../util");
const Handlers = require("../../handlers/groups");

const getGroupRankings = catchErrors(require("./getGroupRankings"));
const sendMessageToAllGroups = catchErrors(require("./sendMessageToAllGroups"));

/* Get single group info */
router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const group = await Handlers.getGroupById(id);

    if (!group) throw Boom.badData("Failed to get group by id");

    res.json({ group });
  })
);

/* Create a group */
router.post(
  "/create",
  catchErrors(async (req, res) => {
    // user access token to be able to
    const { accessToken } = req.body;

    // create a new group
    const { createdGroup, user } = await Handlers.createGroup(accessToken);

    res.json({ createdGroup, user });
  })
);

/* Get group rankings */
router.get(
  "/:id/rankings",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const rankings = await Handlers.getOverallGroupRankings(
      id === "all" ? null : id
    );

    res.json({ rankings });
  })
);

/* Get group rankings for a specific season */
router.get("/:id/rankings/:seasonId", getGroupRankings);

// /* Get season breakdowns for groups */
// router.get("/:groupId/seasons/:seasonId", getGroupSeasons);

/*  send message to all groups */
router.post("/message", sendMessageToAllGroups);

module.exports = router;
