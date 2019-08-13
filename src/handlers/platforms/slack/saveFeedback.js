const { FeedbackServices, GroupServices } = require("../../../services");
const Emitter = require("../../../EventEmitter");

module.exports = async (event, token) => {
  const group = await GroupServices.findGroupBySlackTeamId(event.team);

  if (group) {
    const feedback = await FeedbackServices.create({
      platform: "slack",
      payload: event,
      message: event.text,
      team: event.team,
      response: null
    });

    if (feedback) {
      Emitter.emit("feedbackSlack", event, token);
    }

    return feedback;
  }

  return null;
};
