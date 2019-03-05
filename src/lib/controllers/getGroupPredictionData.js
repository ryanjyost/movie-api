const Movies = require("../../movies");
const Groups = require("../../groups");
const {
  to,
  moviePredictionCutoffDate,
  getMovieScoreMap,
  createObjectId
} = require("../../helpers");

/*
* For movies in purgatory, we want to show the group's prediction breakdowns
*/

const getGroupPredictionData = async (req, res, next) => {
  try {
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

    // get movies currently in purgatory
    let err, movies;
    [err, movies] = await to(Movies.getMovies(query));
    if (err) next(err);

    let movieScoreMap;
    [err, movieScoreMap] = await to(getMovieScoreMap());
    if (err) next(err);

    let group;
    [err, group] = await to(
      Groups.getGroup({ _id: groupId }, { path: "members" })
    );
    if (err) next(err);

    const data = {};

    for (let movie of movies) {
      let userData = [];
      for (let member of group.members) {
        let prediction =
          member.name === "Movie Medium"
            ? 50
            : [movie._id] in member.votes
              ? member.votes[movie._id]
              : null;

        userData.push({
          id: member._id,
          name: member.name,
          prediction: member.name === "Movie Medium" ? 50 : prediction,
          diff: prediction < 0 ? 100 : movie.rtScore - prediction,
          absDiff: prediction < 0 ? 100 : Math.abs(movie.rtScore - prediction)
        });
      }

      data[movie._id] = userData;
    }

    res.json({ breakdowns: data });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

module.exports = getGroupPredictionData;
