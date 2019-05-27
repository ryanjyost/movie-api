const { Groups, Movies } = require("../../src");
const {
  moviePredictionCutoffDate,
  calcNoPredictionPenalty
} = require("../../helpers/index");

module.exports = async (req, res) => {
  const { groupId } = req.params;

  let query = {};
  if (req.params.type === "purgatory") {
    query = {
      $and: [
        { rtScore: { $lt: 0 } },
        {
          $or: [
            { releaseDate: { $lte: moviePredictionCutoffDate } },
            { isClosed: 1 }
          ]
        }
      ]
    };
  } else if (req.params.type === "past") {
    query = {
      rtScore: { $gte: 0 }
    };
  }

  //...get movies currently in purgatory
  const movies = await Movies.getMovies(query);

  //... get group info
  const group = await Groups.getGroup({ _id: groupId }, { path: "members" });

  const data = {};

  // calc prediction results for all movies
  for (let movie of movies) {
    let userData = [];
    for (let member of group.members) {
      if (member.isMM) continue;
      let prediction =
        [movie._id] in member.votes ? member.votes[movie._id] : null;

      let diff =
        prediction < 0
          ? calcNoPredictionPenalty(movie)
          : movie.rtScore - prediction;

      userData.push({
        id: member._id,
        name: member.name,
        prediction,
        diff,
        absDiff: Math.abs(diff)
      });
    }

    data[movie._id] = userData;
  }

  res.json({ breakdowns: data });
};
