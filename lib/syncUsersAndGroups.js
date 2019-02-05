const to = require("./to.js");
const User = require("../models/user.js");
const Group = require("../models/group.js");

module.exports = async () => {
  let err, groups;
  [err, groups] = await to(Group.find());

  for (let group of groups) {
    for (let member of group.members) {
      let user;
      [err, user] = await to(User.findOne({ _id: member }));
      console.log("SUER", user);
      if (user.groups) {
        if (user.groups.indexOf(group._id) < 0) {
          console.log("needs a group");
        }
      } else {
        await to(
          User.findOneAndUpdate(
            { _id: user._id },
            { $set: { groups: [group._id] } }
          )
        );
      }
    }
  }

  let users;
  [err, users] = await to(User.find());
};
