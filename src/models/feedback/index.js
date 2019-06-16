const Feedback = require("./model");

module.exports = {
  create: async data => {
    return await Feedback.create(data);
  },
  findAllFeedback: async () => {
    return await Feedback.find()
      .populate({
        path: "group",
        populate: { path: "members" }
      })
      .sort({ created_at: -1 });
  },
  saveFeedbackResponse: async (id, response) => {
    return await Feedback.findOneAndUpdate(
      { _id: id },
      { $set: { response } },
      { new: true }
    ).populate({
      path: "group",
      populate: { path: "members" }
    });
  }
};
