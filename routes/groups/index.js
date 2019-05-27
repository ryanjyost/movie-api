const express = require("express");
const router = express.Router();

const { catchErrors } = require("../../helpers");

const createGroup = catchErrors(require("./createGroup"));
const getGroup = catchErrors(require("./getGroup"));
const getGroupRankings = catchErrors(require("./getGroupRankings"));
const getGroupSeasons = catchErrors(require("./getGroupSeasonData"));
const sendMessageToAllGroups = catchErrors(require("./sendMessageToAllGroups"));

/* Get single group info */
router.get("/:id", getGroup);

/* Create a group */
router.post("/create", createGroup);

/* Get group rankings */
router.get("/:id/rankings", getGroupRankings);

/* Get group rankings for a specific season */
router.get("/:id/rankings/:seasonId", getGroupRankings);

/* Get season breakdowns for groups */
router.get("/:groupId/seasons/:seasonId", getGroupSeasons);

/*  send message to all groups */
router.post("/message", sendMessageToAllGroups);

module.exports = router;
