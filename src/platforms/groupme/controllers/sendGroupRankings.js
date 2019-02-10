const calculateRankings = require("../../../lib/calculateRankings");
const createGroupMeApi = require("../services/GroupMeApi");
const { to } = require("../../../helpers");

const sendGroupRankings = async (req, res, next) => {
  try {
    let err, rankings;
    [err, rankings] = await to(calculateRankings(req.body.group_id));
    if (err) next(err);

    let text = `🏆 GROUP RANKINGS 🏆` + "\n";

    for (let i = 0; i < rankings.length; i++) {
      if (!rankings[i].numMoviesUserPredicted) {
        text =
          text +
          `${i + 1}) ${rankings[i].name}: No prediction history (yet)` +
          "\n";
      } else {
        text =
          text +
          `${i + 1}) ${rankings[i].name}: ${rankings[i].avgDiff.toFixed(1)}%` +
          "\n";
      }
    }

    const GroupMeApi = createGroupMeApi(process.env.GROUPME_ACCESS_TOKEN);

    text =
      text +
      `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;
    await GroupMeApi.sendBotMessage(text);
  } catch (e) {
    next(e);
  }
};

module.exports = sendGroupRankings;
