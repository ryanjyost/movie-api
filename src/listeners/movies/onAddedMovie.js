const { messageAllGroups } = require("../util");
const { GroupServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;
const { singleMovieSlackMessage } = require("../platforms/slack/util");
const { WebClient } = require("@slack/web-api");

module.exports = async movie => {
  let messages = [`🎥 ${movie.title}`, `${movie.trailer}`];
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    if (group.platform === "groupme") {
      for (let message of messages) {
        await GroupMeServices.sendBotMessage(message, group.bot.bot_id);
      }
    } else if (group.platform === "slack") {
      console.log("NEW MOVIE SLACK");
      const client = new WebClient(group.bot.bot_access_token);

      try {
        await client.chat.postMessage({
          channel: group.slackId,
          blocks: singleMovieSlackMessage(movie)
        });
      } catch (e) {
        console.log("ERROR sending new movie message", e);
      }

      // await client.chat.postMessage({
      //   channel: group.slackId,
      //   blocks: [
      //     {
      //       type: "divider"
      //     }
      //   ]
      // });
    }
  }
};
