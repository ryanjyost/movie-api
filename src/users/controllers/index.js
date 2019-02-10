const { to } = require("../../helpers");
const GroupMe = require("../../platforms/groupme");

// User services
const getUser = require("../services/getUser");
const findOrCreateUser = require("../services/findOrCreateUser");

/* Auth user */
exports.login = async (req, res, next) => {
  let token = req.body.access_token;
  const GroupMeApi = GroupMe.createApi(token);

  //... get user's groupme data
  let err, groupMeUser;
  [err, groupMeUser] = await to(GroupMeApi.getCurrentUser());
  if (err) next(err);

  //... find or create user with groupme data
  let user;
  [err, user] = await to(findOrCreateUser(groupMeUser));
  if (err) next(err);

  res.json({ user, token: user ? (user.isNew ? token : null) : null });
};

/* Get user data */
exports.getUser = async (req, res, next) => {
  let err, existingUser;
  [err, existingUser] = await to(getUser(req.params.id));
  if (err) next(err);

  res.json({ user: existingUser });
};

exports.updateUserPrediction = async (req, res, next) => {
  let err, user;
  [err, user] = await to(getUser(req.body.userId));
  if (err) next(err);

  let updatedUser;
  user.votes =
    "votes" in user
      ? {
          ...user.votes,
          ...{ [req.params.movieId]: Number(req.body.prediction) }
        }
      : { [req.params.movieId]: Number(req.body.prediction) };

  [err, updatedUser] = await to(user.save());
  if (err) next(err);

  res.json({ user: updatedUser });
};
