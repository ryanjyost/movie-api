// const { to } = require("../src/helpers");
// const User = require("../src/users/model");
//
// /*
// * Auth user
// */
// const login = async (req, res) => {
//   const GroupMe = require("../src/lib/groupme/index");
//   let token = req.body.access_token;
//
//   const api = GroupMe.createApi(token);
//
//   let err, user;
//   [err, user] = await to(api.get("/users/me"));
//   // if (user) {
//   //   console.log("USER", user.data);
//   // } else {
//   //   console.log(err.response.data, token);
//   // }
//
//   let newUser;
//   if (user) {
//     [err, newUser] = await to(
//       User.create({
//         groupme: user.data.response,
//         groupmeId: user.data.response.user_id,
//         name: user.data.response.name,
//         phoneNumber: user.data.response.phone_number,
//         email: user.data.response.email
//       })
//     );
//   } else {
//     res.json({ user: null, token: null });
//     return;
//   }
//   //
//   // if (err) {
//   //   res.status(500).json({ error: err });
//   // }
//
//   if (newUser) {
//     res.json({
//       user: newUser,
//       token: req.body.access_token
//     });
//   } else {
//     let existingUser;
//     [err, existingUser] = await to(
//       User.findOne({
//         groupmeId: user.data.response.id
//       })
//     );
//     res.json({ user: existingUser });
//   }
// };
//
// /*
// * Return user data
// */
// const getUser = async (req, res, next) => {
//   let existingUser;
//   [err, existingUser] = await to(
//     User.findOne({
//       _id: req.params.id
//     })
//   );
//
//   // if (err) next(err);
//   res.json({ user: existingUser });
// };
//
// /*
// * Find or create a MM user based on GroupMe info
// */
// const _findOrCreateUser = async (groupmeMemberData, groupmeGroupId) => {
//   let isNew = false;
//   try {
//     let err, user;
//     [err, user] = await to(
//       User.findOne({ groupmeId: groupmeMemberData.user_id })
//     );
//
//     if (!user) {
//       isNew = true;
//       let newUserData = {
//         groupme: groupmeMemberData,
//         groupmeId: groupmeMemberData.user_id,
//         name: groupmeMemberData.name,
//         nickname: groupmeMemberData.nickname,
//         votes: { placeholder: 1 }
//       };
//
//       if (groupmeGroupId) {
//         newUserData.groups = [groupmeGroupId];
//       }
//
//       [err, user] = await to(User.create(newUserData));
//     }
//
//     return user;
//   } catch (e) {
//     return null;
//   }
// };
//
// module.exports = {
//   login,
//   getUser,
//   _findOrCreateUser
// };
