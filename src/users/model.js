const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  groupme: mongoose.Schema.Types.Mixed,
  groupmeId: { type: String, unique: true },
  email: String,
  name: String,
  nickname: String,
  phoneNumber: { type: String },
  accessToken: String,
  votes: mongoose.Schema.Types.Mixed,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "group" }],
  created_at: { type: Date, default: new Date() }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("user", userSchema);
