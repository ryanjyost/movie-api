const GroupMe = require("../platforms/groupme/index");
const Groups = require("../groups");
const Seasons = require("../seasons");
const { to } = require("../../helpers");
const calculateRankings = require("./calculateRankings");

const sendMovieScoreResultsToAllGroups = async (movie, score) => {
  let err, groups;
  [err, groups] = await to(Groups.getGroups({}, "members"));
  if (err) throw new Error(err);

  let season;
  [err, season] = await to(Seasons.getSeason({ id: movie.season }));
  if (err) throw new Error(err);

  for (let group of groups) {
    let mainMessage =
      `🍅 "${movie.title}" has a Rotten Tomatoes Score of ${score}% ` + "\n";
    let scoreMessage =
      `👇 Here are the MM Metrics, sorted from best to worst.` + "\n";

    const rankings = Groups.prepSortGroupPredictions(group, {
      ...movie.toObject(),
      ...{ rtScore: score }
    });

    for (let i = 0; i < rankings.length; i++) {
      let vote = rankings[i];
      console.log("VOTE", vote);

      const noPredictionMessage = "Penalty for not predicting";
      const notActiveMessage = ` User wasn't around yet`;

      if (!vote.wasActiveForMovie) {
        scoreMessage = scoreMessage + `${vote.name}:` + notActiveMessage + "\n";
      } else {
        scoreMessage =
          scoreMessage +
          `${vote.name}: ${vote.diff >= 0 ? "+" : "-"}${Math.abs(
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
      const seasonRankings = await calculateRankings(
        { _id: group._id },
        { season: season.id }
      );

      const emojiMap = [`🥇`, `🥈`, `🥉`];

      let rankingMessage = "";
      for (let player of seasonRankings) {
        if (player.notInSeason) {
          rankingMessage =
            rankingMessage +
            `${player.name}: Joined mid-season, will be eligible next season.` +
            "\n";
        } else {
          rankingMessage =
            rankingMessage +
            `${player.name}: ${Math.abs(player.avgDiff)}% (${
              !player.didVote ? "test" : player.vote
            }${!player.didVote ? "" : "%"}` +
            "\n";
        }
      }

      seasonMessage =
        `🏆 Season ${
          season.id
        } is over! Here are the results, sorted from best to worst average MM Metric for the season.` +
        "\n" +
        rankingMessage +
        "\n" +
        `See more details at https://www.moviemedium.io/current`;
    }

    await GroupMe.sendBotMessage(
      mainMessage + "\n" + scoreMessage,
      group.bot.bot_id
    );

    await GroupMe.sendBotMessage(seasonMessage, group.bot.bot_id);
  }
};

module.exports = sendMovieScoreResultsToAllGroups;
