const _ = require("lodash");
const calcPointsFromPlace = require("./calcPointsFromPlace");

module.exports = (data, propertyToUse = "points", asc) => {
  const sorted = _.orderBy(data, propertyToUse, [asc ? "asc" : "desc"]);

  const rankingsWithPlaces = [];

  let currRanking = 1,
    lastRankingScore = sorted[0][propertyToUse];
  for (let i = 0; i < sorted.length; i++) {
    let currItem = sorted[i];
    currRanking =
      currItem[propertyToUse] == lastRankingScore
        ? currRanking
        : currRanking + 1;

    rankingsWithPlaces.push({
      ...currItem,
      ...{
        place: currRanking,
        points:
          propertyToUse === "points"
            ? currItem.points
            : calcPointsFromPlace(currRanking)
      }
    });
  }
  return rankingsWithPlaces;
};
