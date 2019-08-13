const { PlatformServices } = require("../../../services/index");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async (botId, userName, messageId, groupmeGroupId) => {
  await GroupMeServices.sendBotMessage(
    `Solid first prediction ${userName} 👌. You're officially in the game! Learn more at https://moviemedium.io.`,
    botId
  );

  await GroupMeServices.likeMessage(groupmeGroupId, messageId);
};
