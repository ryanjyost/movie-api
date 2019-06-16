const { GroupServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async message => {
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    await GroupMeServices.sendBotMessage(message, group.bot.bot_id);
  }

  return message;
};
