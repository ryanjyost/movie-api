const {
  GroupServices,
  PlatformServices,
  SeasonServices,
  SharedServices,
  MovieServices,
  MovieScoreMapServices
} = require("../../services");
const { WebClient } = require("@slack/web-api");
const { emojiMap, calcGroupRankingsForSingleMovie } = require("../../util");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async movie => {
  const score = movie.rtScore;
  const groups = await GroupServices.findAllGroups();
  const season = await SeasonServices.findSeasonById(movie.season);
  const moviesInSeason = await MovieServices.findMoviesBySeason(movie.season);

  let movieLabel = ``;
  for (let i = 0; i < moviesInSeason.length; i++) {
    movieLabel =
      movieLabel +
      `_${moviesInSeason[i].title}_` +
      (i === moviesInSeason.length - 1 ? `` : `, `);
  }

  for (let group of groups) {
    let isSlackGroup = group.platform === "slack";

    let mainMessage = isSlackGroup
      ? `*🍅 ${movie.title}* has a Rotten Tomatoes Score of *${score}%*`
      : `🍅 "${movie.title}" has a Rotten Tomatoes Score of ${score}%`;

    mainMessage = mainMessage + "\n";
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
          (isSlackGroup
            ? `${
                emojiMap[user.place - 1] && user.didVote
                  ? emojiMap[user.place - 1]
                  : ""
              } ${user.name}: ${user.absDiff}% _(${user.vote}% prediction)_`
            : `${
                emojiMap[user.place - 1] && user.didVote
                  ? emojiMap[user.place - 1]
                  : ""
              } ${user.name}: ${user.absDiff}% (${user.vote}% prediction)`) +
          "\n";
      }
    }

    let seasonMessage = "";
    let moviesLeftInSeason = season.length - moviesInSeason.length;

    if (moviesLeftInSeason) {
      seasonMessage = isSlackGroup
        ? `_Only ${moviesLeftInSeason} movies left in the current season..._`
        : `Only ${moviesLeftInSeason} movies left in the current season...`;
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
          (isSlackGroup
            ? `*${emojiMap[user.place - 1] || ""}${user.name}* - ${
                user.points
              } _pts_`
            : `${emojiMap[user.place - 1] || ""}${user.name}: ${
                user.points
              } pts`) +
          "\n";
      }

      seasonMessage = isSlackGroup
        ? `*🏆 Season ${season.id} is over!*`
        : `🏆 Season ${season.id} is over!`;
      seasonMessage =
        seasonMessage +
        "\n" +
        (isSlackGroup ? movieLabel : "") +
        "\n" +
        "\n" +
        rankingMessage;
    }

    if (group.platform === "groupme") {
      await GroupMeServices.sendBotMessage(
        mainMessage + "\n" + scoreMessage,
        group.bot.bot_id
      );
      await GroupMeServices.sendBotMessage(seasonMessage, group.bot.bot_id);
    } else if (group.platform === "slack") {
      const client = new WebClient(group.bot.bot_access_token);

      try {
        await client.chat.postMessage({
          channel: group.slackId,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${mainMessage}` + "\n" + scoreMessage
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: seasonMessage
              }
            },
            {
              type: "divider"
            }
          ]
        });
      } catch (e) {
        console.log("ERROR sending movie score results", e);
      }

      // await client.chat.postMessage({
      //   channel: group.slackId,
      //   text: mainMessage + "\n" + scoreMessage
      // });
      //
      // await client.chat.postMessage({
      //   channel: group.slackId,
      //   text: seasonMessage
      // });
    }
  }
};
