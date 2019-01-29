const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  map: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("movieScoreMap", schema);
