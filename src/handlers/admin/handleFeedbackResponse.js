const { FeedbackServices, PlatformServices } = require("../../services");
const GroupMeServices = PlatformServices.GroupMe;

module.exports = async (id, message) => {
  const updatedFeedback = await FeedbackServices.saveFeedbackResponse(
    id,
    message
  );

  const messageResponse = await GroupMeServices.sendMessageToGroup(
    updatedFeedback.group.groupme.id,
    message
  );

  if (messageResponse) {
    return updatedFeedback;
  }

  // Emitter.emit(
  //   "respondedToFeedback",
  //   message,
  //   updatedFeedback.group.bot.bot_id
  // );
};
