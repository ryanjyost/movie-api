const axios = require("axios");
const to = require("./to.js");
const Movie = require("../models/movie.js");
const User = require("../models/user.js");

const createApi = token => {
  return axios.create({
    baseURL: "https://api.groupme.com/v3",
    timeout: 10000,
    headers: {
      "X-Custom-Header": "foobar",
      "Content-Type": "application/json",
      Host: "api.groupme.com",
      "X-Access-Token": token
    }
  });
};

const sendBotMessage = async text => {
  return new Promise(async (resolve, reject) => {
    let err, response;
    [err, response] = await to(
      axios.post("https://api.groupme.com/v3/bots/post", {
        text,
        bot_id: process.env.GROUPME_BOT_ID
      })
    );

    if (err) {
      reject(err);
    }

    if (response) {
      resolve(response);
    } else {
      reject();
    }
  });
};

const receiveMessage = async (req, res) => {
  const text = req.body.text;
  console.log("BODY", req.body);

  if (req.body.user_id == "0") {
    if (req.body.text.includes("added") || req.body.text.includes("rejoined")) {
      const api = createApi(process.env.GROUPME_ACCESS_TOKEN);
      let err, group;
      [err, group] = await to(api.get(`groups/${req.body.group_id}`));
      if (group) {
        const members = group.data.response.members;
        for (let member of members) {
          let err,
            existingMember = null;
          [err, existingMember] = await to(
            User.findOne({ groupmeId: member.user_id })
          );

          if (!existingMember) {
            let err, newUser;
            [err, newUser] = await to(
              User.create({
                groupme: member,
                groupmeId: member.user_id,
                name: member.name,
                nickname: member.nickname,
                votes: {}
              })
            );

            if (err) {
              console.log("ERROR", err);
            }

            await sendBotMessage(`Welcome ${newUser.name} 👋`);
            await sendBotMessage(
              `Learn how to play and manage your predictions at ${
                process.env.CLIENT_URL
              }`
            );
          }
        }
      }
    }
  } else if (text.includes("=")) {
    const split = text.split("=");
    const title = split[0].trim().toLowerCase();
    const rawScore = split[1].trim().replace("%", "");
    const scoreNum = Number(rawScore);

    if (scoreNum >= 0 && scoreNum <= 100) {
      let user, err;
      [err, user] = await to(User.findOne({ groupmeId: req.body.user_id }));

      if (!user) {
        let err, newUser;
        [err, newUser] = await to(
          User.create({
            groupme: req.body,
            groupmeId: req.body.user_id,
            name: req.body.name,
            nickname: req.body.name,
            votes: {}
          })
        );
        await sendBotMessage(
          `Solid first prediction ${
            req.body.name
          } 👌 Track how accurate you are at https://moviemedium.io.`
        );
        res.json({ error: "No user" });
        return;
      }

      let movie;
      [err, movie] = await to(Movie.findOne({ title_lower: title }));

      if (!movie) {
        await sendBotMessage(
          `Hmmm, I couldn't find that movie. Try making your prediction at https://moviemedium.io`
        );
        res.json({ error: "No movie" });
        return;
      }

      console.log("MOVIE", movie);
      if ((movie ? !movie.isClosed : false) && user) {
        console.log(`<==== VOTE ${movie.title} ====>`);
        try {
          let updatedMovie;
          movie.votes =
            "votes" in movie
              ? { ...movie.votes, ...{ [user.id]: scoreNum } }
              : { [user.id]: scoreNum };

          await to(movie.save());

          let updatedUser;
          user.votes =
            "votes" in user
              ? { ...user.votes, ...{ [movie.id]: scoreNum } }
              : { [movie.id]: scoreNum };

          await to(user.save());

          await likeMessage(req.body.group_id, req.body.id);
        } catch (e) {
          console.log("ERROR");
        }

        res.json({ msg: "success" });
      } else {
        await sendBotMessage(
          `Crap 💩 Your prediction didn't get saved for some reason. Use moviemedium.io for now and send Movie Medium a direct message if the problem persists.`
        );
        res.json({ msg: "error" });
      }
    }
  }
};

// const sendDirectMessage = async (recipient, message) => {
//   const api = createApi(process.env.GROUPME_ACCESS_TOKEN);
//
//   let err, user;
//   [err, user] = await to(api.get("/users/me"));
//   console.log("USER!", user.data);
//
//   let response;
//   console.log("HEY", recipient, message);
//
//   [err, response] = await to(api.post(`/direct_messages`, {}));
//   if (response) {
//     console.log(response.data);
//   } else {
//     console.log("ERROR!");
//   }
// };

const likeMessage = async (groupId, messageId) => {
  const api = createApi(process.env.GROUPME_ACCESS_TOKEN);
  let err, response;
  console.log("HEY", groupId, messageId);

  [err, response] = await to(
    api.post(`/messages/${groupId}/${messageId}/like`)
  );
  if (response) {
    console.log(response.data);
  } else {
    console.log("ERROR!");
  }
};

const getUsersInGroup = async (req, res) => {
  const api = createApi(process.env.GROUPME_ACCESS_TOKEN);

  let response;
  [err, response] = await to(api.get(`/groups/${req.params.groupId}`));
  // if (response) {
  //   console.log(response.data);
  // } else {
  //   console.log("ERROR!");
  // }
};

module.exports = {
  createApi,
  sendBotMessage,
  receiveMessage,
  getUsersInGroup
};
