const { Movies } = require("../../models");
const { sanitizeTitle } = require("../../util/index");
// const getMovies = require("./getMovies");
const Fuse = require("fuse.js");
const stringSimilarity = require("string-similarity");

/*
* Message in platform chat may not match clean title, s find best matches
*/

const fuseOptions = {
  caseSensitive: false,
  shouldSort: true,
  findAllMatches: true,
  includeScore: true,
  tokenize: true,
  keys: ["title_lower"]
};

module.exports = async textToSearch => {
  let matchingMovie = null;
  let cleanTitle = sanitizeTitle(textToSearch);

  // get movies that user could possibly be predicting
  const movies = await Movies.findUpcomingMovies();

  const fuse = new Fuse(movies, fuseOptions);

  const matchingMovies = fuse.search(cleanTitle);

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
      // await GroupMe.sendBotMessage(
      // 	`I assumed you meant "${
      // 		closestMatch.title
      // 		}". If that's wrong, try again and learn how to type 😏️`,
      // 	group.bot.bot_id
      // );
      foundMovie = closestMatch;
    }
  }

  if (foundMovie) {
    matchingMovie = foundMovie;
  }

  return matchingMovie;
};
