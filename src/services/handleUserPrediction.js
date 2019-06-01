const GroupMe = require("../platforms/groupme");
const User = require("../models/users/model");
const Groups = require("../models/groups");
const Group = require("../models/groups/model");
const Movies = require("../models/movies");
const { isMoviePastPredictionDeadline, sanitizeTitle } = require("../util");
const stringSimilarity = require("string-similarity");

/*
* Process a user making a prediction within a platform chat
*/
const handleUserPrediction = async req => {
  const { text } = req.body;

  // prep text
  const split = text.includes("=") ? text.split("=") : text.split("-");
  let title = split[0].trim();
  let cleanTitle = sanitizeTitle(title);
  const rawScore = split[1].trim().replace("%", "");
  const scoreNum = Number(rawScore);

  const group = await Groups.getGroup({ groupmeId: req.body.group_id });

  // handle invalid prediction
  if (isNaN(scoreNum)) {
    return;
  } else if (!(scoreNum >= 0 && scoreNum <= 100)) {
    await GroupMe.sendBotMessage(
      `Your prediction has to be a percentage between 0% and 100%️`,
      group.bot.bot_id
    );
    return;
  }

  // look for exact match
  let movie = await Movies.getMovie({ title_lower: cleanTitle });

  // no exact match, so do some fuzzy searching
  if (!movie) {
    const matchingMovies = await Movies.fuzzySearchMovies(cleanTitle);

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
      if (similarity > 0.4) {
        foundMovie = closestMatch;
      } else if (similarity > 0.2) {
        // warn user, but record the prediction
        await GroupMe.sendBotMessage(
          `I assumed you meant "${
            closestMatch.title
          }". If that's wrong, try again and learn how to type 😏️`,
          group.bot.bot_id
        );
        foundMovie = closestMatch;
      }
    }

    if (foundMovie) {
      movie = foundMovie;
    } else {
      return;
    }
  }

  // if movie can't be predicted anymore
  if (
    movie.isClosed > 0 ||
    isMoviePastPredictionDeadline(movie.releaseDate) ||
    movie.rtScore > -1
  ) {
    await GroupMe.sendBotMessage(
      `"${movie.title}" is passed the prediction deadline ☹️`,
      group.bot.bot_id
    );
    return false;
  }

  // look for existing user making the prediction
  const user = await User.findOne({ groupmeId: req.body.user_id });

  if (movie && user) {
    movie.votes =
      "votes" in movie
        ? { ...movie.votes, ...{ [user.id]: scoreNum } }
        : { [user.id]: scoreNum };

    await movie.save();

    user.votes =
      "votes" in user
        ? { ...user.votes, ...{ [movie.id]: scoreNum } }
        : { [movie.id]: scoreNum };

    await user.save();

    await GroupMe.likeMessage(req.body.group_id, req.body.id);

    return true;
  } else if (!user && movie) {
    const group = await Group.findOne({ groupmeId: req.body.group_id });

    const newUser = await User.create({
      groupme: req.body,
      groupmeId: req.body.user_id,
      name: req.body.name,
      nickname: req.body.name,
      votes: { [movie._id]: rawScore },
      groups: group ? [group._id] : []
    });

    if (newUser) {
      await Groups.addUserToGroup(newUser._id, { _id: group._id });

      await GroupMe.sendBotMessage(
        `Solid first prediction ${
          req.body.name
        } 👌 You're officially in the game! Learn more at https://moviemedium.io.`,
        group.bot.bot_id
      );
    }
  } else {
    await GroupMe.sendBotMessage(
      `Crap 💩 Your prediction didn't get saved for some reason. Use moviemedium.io for now and send Movie Medium a direct message if the problem persists.`,
      group.bot.bot_id
    );
    return false;
  }
};

module.exports = handleUserPrediction;
