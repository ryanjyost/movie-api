const GroupMe = require("../platforms/groupme");
const Users = require("../users");
const User = require("../users/model");
const Groups = require("../groups");
const Group = require("../groups/model");
const Movies = require("../movies");
const {
  to,
  isMoviePastPredictionDeadline,
  moviePredictionCutoffDate,
  sanitizeTitle
} = require("../helpers");
const stringSimilarity = require("string-similarity");

/*
* Process a user making a prediction within a platform chat
*/
const handleUserPrediction = async (req, res, next) => {
  try {
    const text = req.body.text;

    // prep text
    const split = text.includes("=") ? text.split("=") : text.split("-");
    let title = split[0].trim();
    let cleanTitle = sanitizeTitle(title);
    const rawScore = split[1].trim().replace("%", "");
    const scoreNum = Number(rawScore);

    // handle invalid prediction
    if (isNaN(scoreNum)) {
      return next("error");
    } else if (!(scoreNum >= 0 && scoreNum <= 100)) {
      await GroupMe.sendBotMessage(
        `Your prediction has to be a percentage between 0% and 100%️`
      );
      return next("error");
    }

    // look for exact match
    let err, movie;
    [err, movie] = await to(Movies.getMovie({ title_lower: cleanTitle }));
    if (err) next(err);

    // no exact match, so do some fuzzy searching
    if (!movie) {
      let matchingMovies;
      [err, matchingMovies] = await to(Movies.fuzzySearchMovies(cleanTitle));
      if (err) next(err);

      let foundMovie = null;

      // get closest match or find that search wasn't close enough
      if (matchingMovies.length > 0) {
        // fuse's closest match
        const closestMatch = matchingMovies[0].item;

        // use better string comparison metric
        const similarity = stringSimilarity.compareTwoStrings(
          closestMatch.title_lower,
          cleanTitle
        );

        // close enough to just assume
        if (similarity > 0.7) {
          foundMovie = closestMatch;
        } else if (similarity > 0.4) {
          // warn user, but record the prediction
          await GroupMe.sendBotMessage(
            `I assumed you meant "${
              closestMatch.title
            }". If that's wrong, try again and learn how to type 😏️`
          );
          foundMovie = closestMatch;
        }
      }

      if (foundMovie) {
        movie = foundMovie;
      } else {
        next(new Error("No movies matching prediction"));
        return false;
      }
    }

    // if movie can't be predicted anymore
    if (
      movie.isClosed > 0 ||
      isMoviePastPredictionDeadline(movie.releaseDate) ||
      movie.rtScore > -1
    ) {
      await GroupMe.sendBotMessage(
        `"${movie.title}" is passed the prediction deadline ☹️`
      );
      return false;
    }

    // look for existing user making the prediction
    let user;
    [err, user] = await to(User.findOne({ groupmeId: req.body.user_id }));
    if (err) next(err);

    if (movie && user) {
      movie.votes =
        "votes" in movie
          ? { ...movie.votes, ...{ [user.id]: scoreNum } }
          : { [user.id]: scoreNum };

      await to(movie.save());

      user.votes =
        "votes" in user
          ? { ...user.votes, ...{ [movie.id]: scoreNum } }
          : { [movie.id]: scoreNum };

      await to(user.save());

      await GroupMe.likeMessage(req.body.group_id, req.body.id);

      return true;
    } else if (!user && movie) {
      let err, group;
      [err, group] = await to(Group.findOne({ groupmeId: req.body.group_id }));

      let newUser;
      [err, newUser] = await to(
        User.create({
          groupme: req.body,
          groupmeId: req.body.user_id,
          name: req.body.name,
          nickname: req.body.name,
          votes: { [movie._id]: rawScore },
          groups: [group._id || null]
        })
      );

      if (newUser) {
        await to(Groups.addUserToGroup(newUser._id, group._id));

        await GroupMe.sendBotMessage(
          `Solid first prediction ${
            req.body.name
          } 👌 Track how accurate you are at https://moviemedium.io.`
        );
      }
    } else {
      await GroupMe.sendBotMessage(
        `Crap 💩 Your prediction didn't get saved for some reason. Use moviemedium.io for now and send Movie Medium a direct message if the problem persists.`
      );
      return false;
    }
  } catch (e) {
    next(e);
  }
};

module.exports = handleUserPrediction;
