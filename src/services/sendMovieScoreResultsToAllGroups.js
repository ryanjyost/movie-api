const GroupMe = require("../platforms/groupme/index");
const Groups = require("../models/groups");
const Seasons = require("../models/seasons");
const calculateRankings = require("./calculateRankings");

const sendMovieScoreResultsToAllGroups = async (movie, score) => {
  const groups = await Groups.getGroups({}, "members");

  const season = await Seasons.getSeason({ id: movie.season });

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

      const noPredictionMessage = "Penalty for not predicting";
      const notActiveMessage = `N/A (Not a user when predictions closed)`;

      if (!vote.wasActiveForMovie) {
        scoreMessage = scoreMessage + `${vote.name}:` + notActiveMessage + "\n";
      } else {
        scoreMessage =
          scoreMessage +
          `${vote.name}: ${Math.abs(vote.diff)}% (${
            !vote.didVote ? noPredictionMessage : vote.vote
          }${!vote.didVote ? "" : "% prediction"})` +
          "\n";
      }
    }

    let seasonMessage = "";

    let moviesLeftInSeason = season.length - season.movies.length;

    if (moviesLeftInSeason) {
      seasonMessage = `Only ${moviesLeftInSeason} movies left in the current season...`;
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
            `${player.name}: ${Math.abs(player.avgDiff)}%` +
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
