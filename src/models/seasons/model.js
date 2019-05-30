const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const seasonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  length: Number,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "movie" }],
  winnerMap: mongoose.Schema.Types.Mixed,
  metrics: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

seasonSchema.plugin(uniqueValidator);

module.exports = mongoose.model("season", seasonSchema);
