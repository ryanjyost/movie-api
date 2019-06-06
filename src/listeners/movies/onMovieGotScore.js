const {
  GroupServices,
  PlatformServices,
  SeasonServices,
  SharedServices,
  MovieServices,
  MovieScoreMapServices
} = require("../../services");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async movie => {
  const score = movie.rtScore;
  const groups = await GroupServices.findAllGroups();
  const season = await SeasonServices.findSeasonById(movie.season);
  const moviesInSeason = await MovieServices.findMoviesBySeason(movie.season);
  const MovieScoreMap = await MovieScoreMapServices.get();

  let mainMessage =
    `🍅 "${movie.title}" has a Rotten Tomatoes Score of ${score}% ` + "\n";
  let scoreMessage =
    `👇 Here are the MM Metrics, sorted from best to worst.` + "\n";

  for (let group of groups) {
    const movieRankings = await GroupServices.calcGroupRankingsForSingleMovie(
      group,
      movie
    );

    for (let i = 0; i < movieRankings.length; i++) {
      let user = movieRankings[i];

      const noPredictionMessage = "Penalty for not predicting";
      const notActiveMessage = `N/A (Not a user when predictions closed)`;

      if (!user.wasActiveForMovie) {
        scoreMessage = scoreMessage + `${user.name}:` + notActiveMessage + "\n";
      } else {
        scoreMessage =
          scoreMessage +
          `${user.name}: ${Math.abs(user.diff)}% (${
            !user.didVote ? noPredictionMessage : user.vote
          }${!user.didVote ? "" : "% prediction"})` +
          "\n";
      }
    }

    let seasonMessage = "";
    let moviesLeftInSeason = season.length - season.movies.length;

    if (moviesLeftInSeason) {
      seasonMessage = `Only ${moviesLeftInSeason} movies left in the current season...`;
    } else {
      // season ended, so send season results
      const seasonRankings = await SharedServices.calculateRankings(
        group.members,
        moviesInSeason,
        MovieScoreMap,
        season
      );

      const emojiMap = [`🥇`, `🥈`, `🥉`];
      let rankingMessage = "";
      for (let user of seasonRankings) {
        if (user.notInSeason) {
          rankingMessage =
            rankingMessage +
            `${user.name}: Joined mid-season, will be eligible next season.` +
            "\n";
        } else {
          rankingMessage =
            rankingMessage + `${user.name}: ${Math.abs(user.avgDiff)}%` + "\n";
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

    await GroupMeServices.sendBotMessage(
      mainMessage + "\n" + scoreMessage,
      group.bot.bot_id
    );

    await GroupMeServices.sendBotMessage(seasonMessage, group.bot.bot_id);
  }
};
