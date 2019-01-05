const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const movieSchema = new mongoose.Schema({
  title: String,
  title_lower: String,
  summary: String,
  trailer: String,
  rtLink: String,
  rtScore: Number,
  releaseDate: Number,
  votes: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

movieSchema.plugin(uniqueValidator);

module.exports = mongoose.model("movie", movieSchema);
