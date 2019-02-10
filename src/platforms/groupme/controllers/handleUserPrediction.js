const createGroupMeApi = require("../services/GroupMeApi");
const Users = require("../../../users");
const Movies = require("../../../movies");
const { to, isMoviePastPredictionDeadline } = require("../../../helpers");

const handleUserPrediction = async (req, res, next) => {
  const text = req.body.text;
  const GroupMeApi = createGroupMeApi(process.env.GROUPME_ACCESS_TOKEN);

  try {
    const split = text.includes("=") ? text.split("=") : text.split("-");
    let lowerTitle = split[0].trim().toLowerCase();
    let cleanTitle = lowerTitle.replace(/[^\w ]/g, "");
    const rawScore = split[1].trim().replace("%", "");
    const scoreNum = Number(rawScore);

    if (isNaN(scoreNum)) {
      return false;
    } else if (!(scoreNum >= 0 && scoreNum <= 100)) {
      await GroupMeApi.sendBotMessage(
        `Your prediction has to be a percentage between 0% and 100%️`
      );
      return null;
    }

    let err, user;
    [err, user] = await to(Users.getUser({ groupmeId: req.body.user_id }));

    let movie;
    [err, movie] = await to(Movies.getMovie({ title_lower: cleanTitle }));
    console.log("USR!!!1", user);

    if (!movie) {
      let err, foundMovie;
      [err, foundMovie] = await to(_fuzzySearchMovies(text));

      if (foundMovie) {
        movie = foundMovie;
      } else {
        return false;
      }
    }

    console.log("FOUND", movie);

    if (
      movie.isClosed > 0 ||
      isMoviePastPredictionDeadline(movie.releaseDate) ||
      movie.rtScore > -1
    ) {
      await GroupMeApi.sendBotMessage(
        `"${movie.title}" is passed the prediction deadline ☹️`
      );
      return false;
    } else if (movie && user) {
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

      await likeMessage(req.body.group_id, req.body.id);

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

        await sendBotMessage(
          `Solid first prediction ${
            req.body.name
          } 👌 Track how accurate you are at https://moviemedium.io.`
        );
      }
    } else {
      await sendBotMessage(
        `Crap 💩 Your prediction didn't get saved for some reason. Use moviemedium.io for now and send Movie Medium a direct message if the problem persists.`
      );
      return false;
    }
  } catch (e) {
    console.log("ERROR", e);
  }
};

module.exports = handleUserPrediction;
