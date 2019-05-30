const GroupMe = require("../models/platforms/groupme");
const Groups = require("../models/groups");

module.exports = async req => {
  const { text } = req.body;
  if (text.includes("added")) {
    const isMovieMediumInitiated = text
      .split("added")[0]
      .includes("Movie Medium");

    if (!isMovieMediumInitiated) {
      const name = text.split("added ")[1].split(" to")[0];

      const GroupMeApi = GroupMe.createApi(process.env.GROUPME_ACCESS_TOKEN);

      // get info on the groupme group that received the message
      const groupMeGroup = await GroupMeApi.getGroup(req.body.group_id);

      // if nothing went wrong fetching the group info
      if (groupMeGroup) {
        const group = await Groups.getGroup({
          groupmeId: groupMeGroup.data.response.group_id
        });

        await GroupMeApi.sendBotMessage(
          `Hey ${name} 👋 Predict a movie in this chat or go to moviemedium.io to officially start proving your movie prowess! (By doing so, you agree to our terms of service and privacy policy️.)`,
          group.bot.bot_id
        );
      }
    }
  }
};
