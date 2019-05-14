const GroupMe = require("../platforms/groupme/index");
const Groups = require("../groups");
const Seasons = require("../seasons");
const { to } = require("../helpers");

const sendMovieScoreResultsToAllGroups = async (movie, score) => {
  let err, groups;
  [err, groups] = await to(Groups.getGroups({}, "members"));
  if (err) throw new Error(err);

  let season;
  [err, season] = await to(Seasons.getSeason({ id: movie.season }));
  if (err) throw new Error(err);

  const emojiMap = [`🥇`, `🥈`, `🥉`];

  for (let group of groups) {
    let mainMessage =
      `🍅 "${movie.title}" has a Rotten Tomatoes Score of ${score}% ` + "\n";
    let scoreMessage = ``;

    const rankings = Groups.prepSortGroupPredictions(group, {
      ...movie.toObject(),
      ...{ rtScore: score }
    });

    for (let i = 0; i < rankings.length; i++) {
      let vote = rankings[i];

      const noPredictionMessage = "Penalty for not predicting";
      const notActiveMessage = ` User wasn't around yet`;

      if (!vote.wasActiveForMovie) {
        scoreMessage =
          scoreMessage +
          `${emojiMap[i] || i + 1}) ${vote.name}:` +
          notActiveMessage +
          "\n";
      } else {
        scoreMessage =
          scoreMessage +
          `${i + 1}) ${vote.name}: ${vote.diff >= 0 ? "+" : "-"}${Math.abs(
            vote.diff
          )}% (${!vote.didVote ? noPredictionMessage : vote.vote}${
            !vote.didVote ? "" : "%"
          })` +
          "\n";
      }
    }

    let seasonMessage = "";

    let moviesLeftInSeason = season.length - season.movies.length;

    if (moviesLeftInSeason) {
      seasonMessage = `Only ${moviesLeftInSeason} movies left in the season...`;
    } else {
      seasonMessage =
        `Season ${season.id} has a winner 🏆` +
        "\n" +
        `Find out who at https://www.moviemedium.io/current`;
    }

    await GroupMe.sendBotMessage(
      mainMessage + "\n" + scoreMessage + "\n" + seasonMessage,
      group.bot.bot_id
    );
  }
};

module.exports = sendMovieScoreResultsToAllGroups;
