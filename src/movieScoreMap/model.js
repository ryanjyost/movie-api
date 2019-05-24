const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  map: mongoose.Schema.Types.Mixed,
  id: Number
});

module.exports = mongoose.model("movieScoreMap", schema);
