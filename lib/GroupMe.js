const axios = require("axios");
const to = require("./to.js");
const Movie = require("../models/movie.js");
const User = require("../models/user.js");
const Group = require("../models/group.js");
const GroupController = require("../controllers/GroupController");
const moment = require("moment");
const Fuse = require("fuse.js");
const queryString = require("query-string");

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

const _handleGroupmeAutomatedMessage = async req => {
  console.log("GROUPME AUTO MESSAGE");
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
              votes: { placholder: 1 },
              groups: [req.body.group_id]
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
};

const _fuzzySearchMovies = async searchText => {
  const split = searchText.includes("=")
    ? searchText.split("=")
    : searchText.split("-");
  let searchTitle = split[0].trim().toLowerCase();
  searchTitle = searchTitle.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  searchTitle = searchTitle.replace(/\s{2,}/g, " ");
  const rawScore = split[1].trim().replace("%", "");
  const scoreNum = Number(rawScore);
  let cutoffDate = moment()
    .add(7, "days")
    .unix();

  let upcomingMovies;
  [err, upcomingMovies] = await to(
    Movie.find({
      isClosed: 0,
      rtScore: { $lt: 0 },
      releaseDate: { $gt: cutoffDate }
    })
  );

  const fuseOptions = {
    caseSensitive: false,
    shouldSort: true,
    findAllMatches: true,
    // includeScore: true,
    tokenize: true,
    keys: ["title_lower"]
  };

  const fuse = new Fuse(upcomingMovies, fuseOptions);
  const results = fuse.search(searchTitle);
  console.log("RESULTS", searchTitle, results);

  if (results.length > 1) {
    await sendBotMessage(
      `I found a couple movies that could match "${split[0].trim()}" and assumed you meant "${
        results[0].title
      }". If that's wrong, try again and learn how to type 😏️`
    );
    return results[0];
  } else if (results.length === 0) {
    // await sendBotMessage(
    //   `Hmm, I couldn't find any upcoming movies that match "${split[0].trim()}" 😬`
    // );
    return null;
  } else {
    return results[0];
  }

  // console.log("UPCOMING", upcomingMovies);
};

const _handleUserPrediction = async (req, text) => {
  const split = text.includes("=") ? text.split("=") : text.split("-");
  let lowerTitle = split[0].trim().toLowerCase();
  let cleanTitle = lowerTitle.replace(/[^\w ]/g, "");
  const rawScore = split[1].trim().replace("%", "");
  const scoreNum = Number(rawScore);

  if (scoreNum >= 0 && scoreNum <= 100) {
    let user, err;
    [err, user] = await to(User.findOne({ groupmeId: req.body.user_id }));

    let movie;
    [err, movie] = await to(Movie.findOne({ title_lower: cleanTitle }));

    if (!user) {
      let err, newUser;
      [err, newUser] = await to(
        User.create({
          groupme: req.body,
          groupmeId: req.body.user_id,
          name: req.body.name,
          nickname: req.body.name,
          votes: { [movie._id]: rawScore }
        })
      );

      if (newUser) {
        await sendBotMessage(
          `Solid first prediction ${
            req.body.name
          } 👌 Track how accurate you are at https://moviemedium.io.`
        );
      }
      return;
    } else if (!movie) {
      let err, foundMovie;
      [err, foundMovie] = await to(_fuzzySearchMovies(text));

      if (foundMovie) {
        movie = foundMovie;
      } else {
        return false;
      }
    } else if (
      movie.isClosed > 0 ||
      moment
        .unix(movie.releaseDate)
        .subtract(7, "days")
        .isBefore(moment())
    ) {
      await sendBotMessage(
        `"${movie.title}" is passed the prediction deadline ☹️`
      );
      return false;
    }

    if (movie && user) {
      try {
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
      } catch (e) {
        console.log("ERROR");
      }

      return true;
    } else {
      await sendBotMessage(
        `Crap 💩 Your prediction didn't get saved for some reason. Use moviemedium.io for now and send Movie Medium a direct message if the problem persists.`
      );
      return false;
    }
  } else {
    return false;
  }
};

const _sendGroupRankings = async req => {
  let err, rankings;
  [err, rankings] = await to(GroupController.calcRankings(req.body.group_id));
};

const receiveMessage = async (req, res) => {
  // console.log("GROUPME", req.body);
  const text = req.body.text;
  let err, payload;

  if (req.body.user_id == "0") {
    [err, payload] = await to(_handleGroupmeAutomatedMessage(req));
    res.json({ msg: payload || err });
  } else if (
    text.toLowerCase().includes("ranking?") ||
    text.toLowerCase().includes("rankings?")
  ) {
    [err, payload] = await to(_sendGroupRankings(req));
    res.json({ msg: payload || err });
  } else if (text.includes("=") || text.includes("-")) {
    [err, payload] = await to(_handleUserPrediction(req, text));
    res.json({ msg: payload || err });
  }
};

const likeMessage = async (groupId, messageId) => {
  const api = createApi(process.env.GROUPME_ACCESS_TOKEN);
  let err, response;

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

const getUser = async (req, res) => {
  console.log(req.body);
  const api = createApi(req.body.access_token);

  let response;
  [err, response] = await to(api.get(`/users/me`));
  if (err) {
    res.status(500).json({ err: "ERROR" });
  } else {
    res.json({ user: response.data.response });
  }
};

const getSingleUserGroups = async (req, res) => {
  const api = createApi(req.body.access_token);

  const params = {
    omit: "memberships",
    per_page: 100
  };

  let paramsString = queryString.stringify(params);

  let response;
  [err, response] = await to(api.get(`/groups`, paramsString));
  if (err) {
    res.status(500).json({ err: "ERROR" });
  } else {
    res.json({ groups: response.data.response });
  }
};

module.exports = {
  createApi,
  sendBotMessage,
  receiveMessage,
  getUsersInGroup,
  getUser,
  getSingleUserGroups
};
