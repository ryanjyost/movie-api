const _ = require("lodash");
const calcPointsFromPlace = require("./calcPointsFromPlace");

module.exports = (data, propertyToUse = "points", asc) => {
  // console.log("DATA", data);
  const sorted = _.orderBy(data, propertyToUse, [asc ? "asc" : "desc"]);

  const rankingsWithPlaces = [];

  let currRanking = 1,
    lastRankingScore = sorted[0][propertyToUse];
  for (let i = 0; i < sorted.length; i++) {
    let currItem = sorted[i];

    if (currItem[propertyToUse] !== lastRankingScore && i > 0) {
      currRanking = currRanking + 1;
      lastRankingScore = sorted[i][propertyToUse];
    }

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
