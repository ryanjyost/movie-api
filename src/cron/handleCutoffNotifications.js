const {
  MovieServices,
  GroupServices,
  PlatformServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;
const { WebClient } = require("@slack/web-api");

const { moviePredictionCutoffDate } = require("../util");
const moment = require("moment");
const Boom = require("@hapi/boom");
const logger = require("../../config/winston");

module.exports = async daysBeforeCutoff => {
  try {
    const movies = await MovieServices.findUpcomingMovies();

    if (!movies.length) {
      return null;
    }

    let atleastOneMovie = false;

    const groups = await GroupServices.findAllGroups();
    let moviesClosingSoon = {};
    let userIdsBeingMentioned = [];

    // find movies that need a cutoff notification
    for (let movie of movies) {
      if (
        moment
          .unix(movie.releaseDate)
          .utc()
          .diff(moment.unix(moviePredictionCutoffDate), "day") === 4
      ) {
        logger.info(
          `Countdown for ${movie.title} at ${moment
            .utc()
            .format("MM/DD/YYYY H:mm")}`
        );
        atleastOneMovie = true;
        // text = text + "\n" + `${movie.title}`;
        moviesClosingSoon[movie._id] = movie;
      }
    }

    if (!atleastOneMovie) return null;

    // craft the message for each group
    for (let group of groups) {
      let fullMessage =
        `️⏳ Predictions for some movies are closing soon! Here they are with the jabronis who haven't predicted yet.` +
        "\n" +
        "\n";
      // for each movie that's closing soon
      for (let movieId in moviesClosingSoon) {
        let atLeastOneMember = false;
        // generate a meesage with members of the group who haven't predicted yet
        let movieText = `${moviesClosingSoon[movieId].title}: `;
        for (let member of group.members) {
          member = member.toObject();
          if (member.isMM) continue;

          if (movieId in member.votes && member.votes[movieId] > -1) {
            continue;
          } else {
            atLeastOneMember = true;
            // add user name to warning textc
            movieText = movieText + `@${member.name} `;

            // if user id not in mention list, add it
            if (
              userIdsBeingMentioned.indexOf(member.groupme.user_id) < 0 &&
              member.preferences &&
              member.preferences.notifications.platforms.mentions
            ) {
              userIdsBeingMentioned.push(member.groupme.user_id);
            }
          }
        }

        if (atLeastOneMember) {
          fullMessage = fullMessage + movieText + "\n";
        } else {
          fullMessage =
            fullMessage + movieText + `Everyone predicted 👌` + "\n";
        }
      }
      if (group.platform === "groupme") {
        await GroupMeServices.sendMessageToGroup(
          group.groupme.id,
          fullMessage,
          userIdsBeingMentioned
        );
      } else if (group.platform === "slack") {
        const client = new WebClient(group.bot.bot_access_token);

        await client.chat.postMessage({
          channel: group.slackId,
          text: fullMessage
        });
      }
    }
  } catch (e) {
    console.log(e);
    throw Boom.badImplementation("Cutoff notifications failed");
  }
};
