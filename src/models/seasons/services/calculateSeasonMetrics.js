const Season = require("../model");

/*
* Handle movie getting an RT Score
*/
const calculateSeasonMetrics = async seasonId => {
  try {
    return await Season.findOne(query).populate("movies");
  } catch (e) {
    console.log("Error", e);
  }
};

module.exports = calculateSeasonMetrics;
