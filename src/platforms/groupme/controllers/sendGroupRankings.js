const calculateRankings = require("../../../lib/calculateRankings");
const createGroupMeApi = require("../services/GroupMeApi");
const { to } = require("../../../helpers");
const getGroup = require("../../../groups/services/getGroup");

const sendGroupRankings = async (req, res, next) => {
  try {
    let err, rankings;
    [err, rankings] = await to(
      calculateRankings({ groupmeId: req.body.group_id })
    );
    if (err) next(err);

    let text = `🏆 GROUP RANKINGS 🏆` + "\n";

    for (let i = 0; i < rankings.length; i++) {
      if (!rankings[i].moviesInCalc) {
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

    let group;
    [err, group] = await to(getGroup({ groupmeId: req.body.group_id }));
    if (err) next(err);

    await GroupMeApi.sendBotMessage(text, group.bot.bot_id);
  } catch (e) {
    next(e);
  }
};

module.exports = sendGroupRankings;
