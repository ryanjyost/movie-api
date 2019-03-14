const { to } = require("../../helpers");
const GroupMe = require("../../platforms/groupme");
const Groups = require("../../groups");

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

  let userMongoObject;

  if (user.isNew) {
    [err, userMongoObject] = await to(
      findOrCreateUser(groupMeUser, null, true)
    );
    if (err) next(err);

    let userMMGroups = [...userMongoObject.groups];
    //... get user's groups
    let usersGroups;
    [err, usersGroups] = await to(GroupMeApi.getCurrentUsersGroups());
    if (err) next(err);

    for (let group of usersGroups) {
      let err, existingGroup;
      [err, existingGroup] = await to(
        Groups.getGroup({ groupmeId: group.group_id })
      );

      if (existingGroup) {
        await to(
          Groups.addUserToGroup(userMongoObject._id, {
            groupmeId: group.group_id
          })
        );
        userMMGroups.push(existingGroup._id);
      }
    }

    userMongoObject.groups = userMMGroups;
    userMongoObject.save();
  }

  let existingUser;
  [err, existingUser] = await to(
    getUser(
      { _id: user ? user._id : userMongoObject._id },
      {},
      { path: "groups", populate: { path: "members" } }
    )
  );
  if (err) next(err);

  res.json({
    user: existingUser,
    token: user ? (user.isNew ? token : null) : null
  });
};

/* Get user data */
exports.getUser = async (req, res, next) => {
  let err, existingUser;
  [err, existingUser] = await to(
    getUser(
      { _id: req.params.id },
      {},
      { path: "groups", populate: { path: "members" } }
    )
  );
  if (err) next(err);

  res.json({ user: existingUser });
};

exports.updateUserPrediction = async (req, res, next) => {
  let err, user;
  [err, user] = await to(
    getUser(
      { _id: req.body.userId },
      {},
      { path: "groups", populate: { path: "members" } }
    )
  );
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
