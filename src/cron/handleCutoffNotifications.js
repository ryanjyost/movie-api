const {
  MovieServices,
  GroupServices,
  PlatformServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;
const { WebClient } = require("@slack/web-api");
const slackMessageUtil = require("../listeners/platforms/slack/util");

const { moviePredictionCutoffDate } = require("../util");
const moment = require("moment");
const Boom = require("@hapi/boom");
const logger = require("../../config/winston");

module.exports = async movieId => {
  try {
    let movies = [];
    if (movieId) {
      let movie = await MovieServices.findMovieById(movieId);
      movies = [movie];
    } else {
      movies = await MovieServices.findUpcomingMovies();
    }

    if (!movies.length) {
      return null;
    }

    let atleastOneMovie = false;

    const groups = await GroupServices.findAllGroups();
    let moviesClosingSoon = {};
    let userIdsBeingMentioned = [];

    // find movies that need a cutoff notification
    for (let movie of movies) {
      if (!movieId) {
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
      } else {
        atleastOneMovie = true;
        // text = text + "\n" + `${movie.title}`;
        moviesClosingSoon[movie._id] = movie;
      }
    }

    if (!atleastOneMovie) return null;

    // craft the message for each group
    for (let group of groups) {
      let fullMessage =
        (movieId
          ? `⏳ Just a reminder about this movie closing soonish...`
          : `️⏳ Predictions for some movies are closing soon! Here they are with the jabronis who haven't predicted yet.`) +
        "\n" +
        "\n";

      let usersPerMovie = {};
      // for each movie that's closing soon
      for (let movieId in moviesClosingSoon) {
        usersPerMovie[movieId] = ``;

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
            if (member.slack) {
              usersPerMovie[movieId] =
                usersPerMovie[movieId] + `@${member.slack.name} `;
            }

            // if user id not in mention list, add it
            if (
              member.groupme &&
              userIdsBeingMentioned.indexOf(member.groupme.user_id) < 0 &&
              (member.preferences
                ? member.preferences.notifications.platforms.mentions
                : true)
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

      // send the message
      if (group.platform === "groupme") {
        await GroupMeServices.sendMessageToGroup(
          group.groupme.id,
          fullMessage,
          userIdsBeingMentioned
        );
      } else if (group.platform === "slack") {
        const client = new WebClient(group.bot.bot_access_token);
        let blocks = movieId
          ? [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Just a reminder about this movie closing soonish...*`
                }
              }
            ]
          : [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*⏳ Predictions for some movies are closing soon!* Here they are with the jabronis who haven't predicted yet.`
                }
              }
            ];

        for (let movieId in moviesClosingSoon) {
          let movie = moviesClosingSoon[movieId];
          blocks.push(
            slackMessageUtil.singleMovieSlackMessage(
              moviesClosingSoon[movieId],
              usersPerMovie[movie._id] && usersPerMovie[movie._id].length
                ? `Missing predictions from ${usersPerMovie[movie._id]}`
                : `Everyone predicted 👌`
            )
          );
        }

        try {
          await client.chat.postMessage({
            channel: group.slackId,
            blocks
          });
        } catch (e) {
          console.log("ERROR posting cutoff message");
        }
      }
    }
  } catch (e) {
    console.log(e);
    logger.error(e);
    throw Boom.badImplementation("Cutoff notifications failed");
  }
};
