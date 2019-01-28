const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: String,
  groupmeId: String,
  members: Array,
  groupme: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model("group", groupSchema);
