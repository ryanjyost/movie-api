const GroupMe = require("../platforms/groupme/index");
const Groups = require("../groups");
const { to } = require("../helpers");
const calculateRankings = require("../groups/services/calculateRankings");

const sendMovieScoreResultsToAllGroups = async (movie, score) => {
  let err, groups;
  [err, groups] = await to(Groups.getGroups({}, "members"));
  if (err) throw new Error(err);

  for (let group of groups) {
    let mainMessage = `🍿 "${
      movie.title
    }" has a Rotten Tomatoes Score of ${score}% `;
    let scoreMessage = ``;

    const rankings = Groups.prepSortGroupPredictions(group, {
      ...movie.toObject(),
      ...{ rtScore: score }
    });

    for (let i = 0; i < rankings.length; i++) {
      let vote = rankings[i];
      scoreMessage =
        scoreMessage +
        `${i + 1}) ${vote.name}: ${vote.diff >= 0 ? "+" : "-"}${Math.abs(
          vote.diff
        )}% (${vote.vote < 0 ? "No prediction" : vote.vote}${
          vote.vote < 0 ? "" : "%"
        })` +
        "\n";
    }

    await GroupMe.sendBotMessage(mainMessage, group.bot.bot_id);
    await GroupMe.sendBotMessage(scoreMessage, group.bot.bot_id);
  }
};

module.exports = sendMovieScoreResultsToAllGroups;
