const { WebClient } = require("@slack/web-api");
const sendUpcomingMovieInfo = require("./sendUpcomingMovieInfo");

module.exports = async (userSlackInfo, groupInfo) => {
  const client = new WebClient(groupInfo.bot.bot_access_token);
  console.log("SLACK INFO", userSlackInfo);

  await client.chat.postEphemeral({
    response_type: "ephemeral",
    user: userSlackInfo.id,
    channel: groupInfo.slackId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hey ${userSlackInfo.profile.display_name ||
            userSlackInfo.profile.real_name ||
            userSlackInfo.name} 👋*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Welcome to Movie Medium, the game where you *predict Rotten Tomatoes Scores of upcoming movies against your coworkers.*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Predict a movie in this channel with the "/predict" command or go to moviemedium.io to officially start proving your movie prowess. _(Btw, the lawyers told me to tell you that playing the game means you agree to our terms of service and privacy policy, available at moviemedium.io️.)_`
        }
      },
      {
        type: "divider"
      }
    ]
  });

  await sendUpcomingMovieInfo(groupInfo, userSlackInfo);
};
