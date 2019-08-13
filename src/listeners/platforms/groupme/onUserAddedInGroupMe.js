const { PlatformServices, GroupServices } = require("../../../services/index");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async (groupmeGroupId, text) => {
  const name = text.split("added ")[1].split(" to")[0];

  const group = await GroupServices.findGroupByGroupMeId(groupmeGroupId);

  await GroupMeServices.sendBotMessage(
    `Sup ${name} 👋. Predict a movie in this chat or go to moviemedium.io to officially start proving your movie prowess. (Btw, the lawyers told me to tell you that playing the game means you agree to our terms of service and privacy policy️.)`,
    group.bot.bot_id
  );
};
