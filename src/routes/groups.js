const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");

const { catchErrors } = require("../util/index");
const Handlers = require("../handlers/groups/index");

/* Get single group info */
router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const group = await Handlers.findGroupById(id);

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
router.get(
  "/:id/rankings/:seasonId",
  catchErrors(async (req, res) => {
    const { id, seasonId } = req.params;

    const rankings = await Handlers.getSeasonRankings(
      id === "all" ? null : id,
      seasonId
    );

    res.json({ rankings });
  })
);

module.exports = router;
