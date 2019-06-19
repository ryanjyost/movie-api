const {
  GroupServices,
  PlatformServices,
  SeasonServices,
  SharedServices,
  MovieServices,
  MovieScoreMapServices
} = require("../../services");

const { emojiMap, calcGroupRankingsForSingleMovie } = require("../../util");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async movie => {
  const score = movie.rtScore;
  const groups = await GroupServices.findAllGroups();
  const season = await SeasonServices.findSeasonById(movie.season);
  const moviesInSeason = await MovieServices.findMoviesBySeason(movie.season);

  for (let group of groups) {
    let mainMessage =
      `🍅 "${movie.title}" has a Rotten Tomatoes Score of ${score}% ` + "\n";
    let scoreMessage = ``;
    // `👇 Here are the MM Metrics, sorted from best to worst.` + "\n";

    const movieRankings = await calcGroupRankingsForSingleMovie(group, movie);

    for (let i = 0; i < movieRankings.length; i++) {
      let user = movieRankings[i];

      const noPredictionMessage = "No prediction";
      const notActiveMessage = `N/A (Not a user when predictions closed)`;

      if (!user.wasActiveForMovie) {
        scoreMessage =
          scoreMessage + `${user.name}: ` + notActiveMessage + "\n";
      } else if (!user.didVote) {
        scoreMessage =
          scoreMessage + `${user.name}: ` + noPredictionMessage + "\n";
      } else {
        scoreMessage =
          scoreMessage +
          `${
            emojiMap[user.place - 1] && user.didVote
              ? emojiMap[user.place - 1]
              : ""
          } ${user.name}: ${user.absDiff}% (${user.vote}% prediction)` +
          "\n";
      }
    }

    let seasonMessage = "";
    let moviesLeftInSeason = season.length - moviesInSeason.length;

    if (moviesLeftInSeason) {
      seasonMessage = `Only ${moviesLeftInSeason} movies left in the current season...`;
    } else {
      // season ended, so send season results
      const seasonRankings = await SharedServices.calculateGroupSeasonRankings(
        group,
        moviesInSeason,
        season
      );

      let rankingMessage = "";
      for (let user of seasonRankings) {
        rankingMessage =
          rankingMessage +
          `${emojiMap[user.place - 1] || ""}${user.name}: ${
            user.points
          } points` +
          "\n";
      }

      seasonMessage =
        `🏆 Season ${season.id} is over!` + "\n" + "\n" + rankingMessage;
    }

    await GroupMeServices.sendBotMessage(
      mainMessage + "\n" + scoreMessage,
      group.bot.bot_id
    );

    await GroupMeServices.sendBotMessage(seasonMessage, group.bot.bot_id);
  }
};
