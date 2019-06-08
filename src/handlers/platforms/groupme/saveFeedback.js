const { FeedbackServices, GroupServices } = require("../../../services");
const Emitter = require("../../../EventEmitter");

module.exports = async payload => {
  const group = await GroupServices.findGroupByGroupMeId(payload.group_id);

  if (group) {
    const feedback = await FeedbackServices.create({
      platform: "groupme",
      payload,
      message: payload.text,
      group: group._id,
      response: null
    });

    if (feedback) {
      Emitter.emit("feedback", feedback.payload.group_id, feedback.payload.id);
    }

    return feedback;
  }

  return null;
};
