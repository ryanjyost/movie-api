const calculateRankings = require("./calculateRankings");
const GroupMe = require("../platforms/groupme");
const Groups = require("../groups");

const sendGroupRankings = async groupmeGroupId => {
  const rankings = await calculateRankings({ groupmeId: groupmeGroupId });

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

  const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);

  text =
    text +
    `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;

  const group = await Groups.getGroup({ groupmeId: groupmeGroupId });

  await GroupMeApi.sendBotMessage(text, group.bot.bot_id);
};

module.exports = sendGroupRankings;
