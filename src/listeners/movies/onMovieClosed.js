const { GroupServices, PlatformServices } = require("../../services");
const { sortArrayByProperty } = require("../../util");
const { WebClient } = require("@slack/web-api");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async movie => {
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    const isSlackGroup = group.platform === "slack";
    let movieMessage = isSlackGroup
      ? `🔒 *${movie.title}* predictions are locked in!`
      : `🔒 "${movie.title}" predictions are locked in!`;
    movieMessage = movieMessage + "\n";

    let sortedMembers = sortArrayByProperty(
      group.members,
      `votes.${movie._id}`,
      false
    );

    let voteMessage = ``;
    for (let user of sortedMembers) {
      if (user.name === "Movie Medium") continue;

      if (user) {
        voteMessage =
          voteMessage +
          (isSlackGroup
            ? `*${user.name}* - ${
                user.votes[movie._id] < 0
                  ? `No prediction`
                  : `${user.votes[movie._id]}% \n`
              }`
            : `${user.name}: ${
                user.votes[movie._id] < 0
                  ? `No prediction`
                  : `${user.votes[movie._id]}%`
              }` + "\n");
      }
    }

    if (group.platform === "groupme") {
      await GroupMeServices.sendBotMessage(
        `${movieMessage}` + "\n" + voteMessage,
        group.bot.bot_id
      );
    } else if (group.platform === "slack") {
      const client = new WebClient(group.bot.bot_access_token);
      await client.chat.postMessage({
        channel: group.slackId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: movieMessage + "\n" + voteMessage
            }
          },
          {
            type: "divider"
          }
        ]
      });
    }
  }
};
