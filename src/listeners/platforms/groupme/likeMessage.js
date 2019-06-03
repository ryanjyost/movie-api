const { PlatformServices } = require("../../../services");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async (groupmeGroupId, messageId) => {
  return await GroupMeServices.likeMessage(groupmeGroupId, messageId);
};
