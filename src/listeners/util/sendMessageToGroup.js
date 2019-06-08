const { PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async (text, botId) => {
  return await GroupMeServices.sendBotMessage(text, botId);
};
