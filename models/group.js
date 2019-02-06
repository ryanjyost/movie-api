const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const groupSchema = new mongoose.Schema({
  name: String,
  groupmeId: { type: String, unique: true },
  members: Array,
  groupme: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

groupSchema.plugin(uniqueValidator);

module.exports = mongoose.model("group", groupSchema);
