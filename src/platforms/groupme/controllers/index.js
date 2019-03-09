const { to } = require("../../../helpers");
const queryString = require("query-string");

// GroupMe Services
const createGroupMeApi = require("../services/GroupMeApi");

// Big operations with tons of deps
const handleGroupMeAutomatedMessage = require("../controllers/handleGroupMeAutomatedMessage");
const sendGroupRankings = require("../controllers/sendGroupRankings");
const handleUserPrediction = require("../../../lib/handleUserPrediction");

/* Receive a message from GroupMe */
exports.receiveMessage = async (req, res, next) => {
  // if it's a GroupMe automated message
  if (req.body.sender_type === "bot") {
    return null;
  }

  // extract message from POST body
  const text = req.body.text;

  // send off into applicable controller
  if (req.body.user_id === "0") {
    // this message was generated by GroupMe, handle accordingly
    await to(handleGroupMeAutomatedMessage(req, res, next));
  } else if (
    text.toLowerCase().includes("ranking?") ||
    text.toLowerCase().includes("rankings?")
  ) {
    // send rankings to the group
    await to(sendGroupRankings(req, res, next));
  } else if (text.includes("=") || text.includes("-")) {
    await to(handleUserPrediction(req, res, next));
  }
};

/* Get all users in a groupme group */
exports.getGroup = async (req, res, next) => {
  const GroupMeApi = createGroupMeApi(process.env.GROUPME_ACCESS_TOKEN);

  let err, response;
  [err, response] = await to(GroupMeApi.getGroup(req.params.groupId));
  if (err) next(err);

  res.json({ group: response });
};

/* Get all of the GroupMe groups that a user is a member of */
exports.getCurrentUsersGroups = async (req, res, next) => {
  const GroupMeApi = createGroupMeApi(req.body.access_token);

  const params = {
    omit: "memberships",
    per_page: 100
  };

  let paramsString = queryString.stringify(params);

  let err, groups;
  [err, groups] = await to(GroupMeApi.getCurrentUsersGroups(paramsString));
  if (err) next(err);

  res.json({ groups });
};

/* Get single GroupMe user */
exports.getUser = async (req, res, next) => {
  const GroupMeApi = createGroupMeApi(req.body.access_token);

  let err, response;
  [err, response] = await to(GroupMeApi.getCurrentUser());
  if (err) next(err);

  res.json({ user: response.data.response });
};
