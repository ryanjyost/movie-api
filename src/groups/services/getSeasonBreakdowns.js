const MovieScoreMap = require("../../../models/movieScoreMap");
const Movies = require("../../movies");
const Seasons = require("../../seasons");
const Users = require("../../users");
const { to, calcNoPredictionPenalty } = require("../../helpers");
const getGroup = require("./getGroup");

/*
* Calc Season Breakdowns
*/

const getSeasonBreakdowns = async (groupQuery, seasonQuery) => {
  try {
    let group = null,
      seasons = null,
      users = [];
    if (groupQuery) {
      group = await getGroup(groupQuery, "members");
      users = group.members;
    } else {
      users = await Users.getUsers();
    }

    if (seasonQuery) {
      seasons = await Seasons.getSeasons(seasonQuery);
      users = group.members;
    } else {
      users = await Users.getUsers();
    }

    return seasons;
  } catch (e) {
    console.log("ERROR", e);
  }
};

module.exports = getSeasonBreakdowns;
