const Season = require("../model");

/*
* Handle movie getting an RT Score
*/
const getSeasons = async (query = {}, sort = { id: -1 }) => {
  try {
    return await Season.find(query)
      .populate("movies")
      .sort(sort);
  } catch (e) {
    console.log("Error", e);
  }
};

module.exports = getSeasons;
