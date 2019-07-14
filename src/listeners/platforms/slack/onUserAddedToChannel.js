const { WebClient } = require("@slack/web-api");

module.exports = async (userSlackInfo, groupInfo) => {
  const client = new WebClient(groupInfo.bot.bot_access_token);

  await client.chat.postEphemeral({
    response_type: "ephemeral",
    user: userSlackInfo.id,
    channel: groupInfo.slackId,

    text: `Sup ${
      userSlackInfo.profile.display_name
    } 👋. Predict a movie in this channel with the "/predict" command or go to moviemedium.io to officially start proving your movie prowess. (Btw, the lawyers told me to tell you that playing the game means you agree to our terms of service and privacy policy️.)`,
    attachments: []
  });
};
