const to = require("../lib/to.js");
const GroupMe = require("../lib/GroupMe");
const User = require("../models/user.js");

const login = async (req, res) => {
  let token = req.body.access_token;

  const api = GroupMe.createApi(token);

  let err, user;
  [err, user] = await to(api.get("/users/me"));
  // if (user) {
  //   console.log("USER", user.data);
  // } else {
  //   console.log(err.response.data, token);
  // }

  let group;
  [err, group] = await to(api.get("/groups/46885156"));

  //temporary retriction
  let isMember =
    group &&
    group.data.response.members.find(
      member => member.user_id === user.data.response.id
    );

  let newUser;
  if (user) {
    [err, newUser] = await to(
      User.create({
        groupme: user.data.response,
        groupmeId: user.data.response.user_id,
        name: user.data.response.name,
        phoneNumber: user.data.response.phone_number,
        email: user.data.response.email
      })
    );
  } else {
    res.json({ user: null, token: null });
    return;
  }
  //
  // if (err) {
  //   res.status(500).json({ error: err });
  // }

  if (newUser) {
    res.json({
      user: newUser,
      token: req.body.access_token,
      isMember: isMember ? 1 : 0
    });
  } else {
    let existingUser;
    [err, existingUser] = await to(
      User.findOne({
        groupmeId: user.data.response.id
      })
    );
    res.json({ user: existingUser, isMember: isMember ? 1 : 0 });
  }
};

const getUser = async (req, res) => {
  let existingUser;
  [err, existingUser] = await to(
    User.findOne({
      _id: req.params.id
    })
  );
  res.json({ user: existingUser });
};

module.exports = {
  login,
  getUser
};
