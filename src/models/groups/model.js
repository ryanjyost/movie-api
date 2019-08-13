const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const groupSchema = new mongoose.Schema({
  name: String,
  groupmeId: { type: String },
  slackId: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  groupme: mongoose.Schema.Types.Mixed,
  slack: mongoose.Schema.Types.Mixed,
  platform: String,
  bot: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

// groupSchema.plugin(uniqueValidator);

module.exports = mongoose.model("group", groupSchema);
