const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  message: String,
  platform: String,
  payload: mongoose.Schema.Types.Mixed,
  group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
  response: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model("feedback", feedbackSchema);
