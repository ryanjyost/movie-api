const { GroupServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async messages => {
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    for (let message of messages) {
      await GroupMeServices.sendBotMessage(message, group.bot.bot_id);
    }
  }

  return true;
};
