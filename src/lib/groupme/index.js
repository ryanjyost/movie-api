const axios = require("axios");
const { to } = require("../../helpers/index");
const Movie = require("../../movies/model.js");
const User = require("../../../models/model.js");
const Group = require("../../groups/model.js");
const UserController = require("../../../controllers/UserController");
const Groups = require("../../groups/index");
const moment = require("moment");
const Fuse = require("fuse.js");
const queryString = require("query-string");

/*
* Create GroupMe App API
*/
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

/*
* Send Bot Message to GroupMe chat
*/
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

/*
* Like a specific message
*/
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

/*
* Get all users in a groupme group
*/
const getUsersInGroup = async (req, res) => {
  const api = createApi(process.env.GROUPME_ACCESS_TOKEN);

  let response;
  [err, response] = await to(api.get(`/groups/${req.params.groupId}`));
  if (response) {
    console.log(response.data);
  } else {
    console.log("ERROR!");
  }
};

/*
* Get single GroupMe user
*/
const getUser = async (req, res) => {
  const api = createApi(req.body.access_token);

  let response;
  [err, response] = await to(api.get(`/users/me`));
  if (err) {
    res.status(500).json({ err: "ERROR" });
  } else {
    res.json({ user: response.data.response });
  }
};

/*
* Get all of the GroupMe groups that a user is a member of
*/
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

/*
* Process a message from GroupMe chat, hand off to applicable function
*/
const receiveMessage = async (req, res) => {
  try {
    // extract message from POST body
    const text = req.body.text;

    // send err or payload to finish function and let HEroku know it's done
    let err, payload;

    // if it's a GroupMe automated message
    if (req.body.sender_type !== "bot") {
      if (req.body.user_id === "0") {
        // check if we need to add a user
        [err, payload] = await to(_handleGroupmeAutomatedMessage(req));
        res.json({ msg: payload || err });
      } else if (
        text.toLowerCase().includes("ranking?") ||
        text.toLowerCase().includes("rankings?")
      ) {
        console.log("body", req.body);
        [err, payload] = await to(Groups.calculateRankings(req.body.group_id));
        res.json({ msg: payload || err });
      } else if (text.includes("=") || text.includes("-")) {
        [err, payload] = await to(_handleUserPrediction(req, text));
        res.json({ msg: payload || err });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to process message" });
  }
};

/*
* Handle an admin message generated by GroupMe
*/
const _handleGroupmeAutomatedMessage = async req => {
  if (req.body.text.includes("added") || req.body.text.includes("rejoined")) {
    console.log("HANDLE NEW USER");
    const api = createApi(process.env.GROUPME_ACCESS_TOKEN);

    // get info on the groupme group that received the message
    let err, response;
    [err, response] = await to(api.get(`groups/${req.body.group_id}`));

    let groupmeGroup = response ? response.data.response : null;

    // if nothing went wrong fetching the group info
    if (groupmeGroup) {
      let group;
      [err, group] = await to(
        Group.findOne({ groupmeId: groupmeGroup.group_id })
      );

      console.log("GROUP", groupmeGroup);

      const members = groupmeGroup.members;
      let updatedMembers = [];
      let hasNewMember = false;

      // check if groupme members are MM users
      for (let member of members) {
        console.log("member", member);
        let err, user;
        [err, user] = await to(
          UserController._findOrCreateUser(member, group._id)
        );

        updatedMembers.push(user._id);

        // if user id isn't in group members, add it
        if (group.members.indexOf(user._id) < 0) {
          hasNewMember = true;
          // await to(GroupController._addUserToGroup(user._id, group._id));
          await sendBotMessage(`Welcome ${user.name} 👋`);
        }
      }

      // send some helper text if there are any new members
      if (hasNewMember) {
        await sendBotMessage(
          `Learn how to play and manage your predictions at ${
            process.env.CLIENT_URL
          }`
        );
      }

      group.members = updatedMembers;
      await group.save();
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
      `I assumed you meant "${split[0].trim()}"${
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
  console.log(req.body);
  try {
    const split = text.includes("=") ? text.split("=") : text.split("-");
    let lowerTitle = split[0].trim().toLowerCase();
    let cleanTitle = lowerTitle.replace(/[^\w ]/g, "");
    const rawScore = split[1].trim().replace("%", "");
    const scoreNum = Number(rawScore);

    if (scoreNum < 0 || scoreNum > 100) {
      await sendBotMessage(
        `Your prediction has to be a percentage between 0% and 100%️`
      );
    }
    let err, user;
    [err, user] = await to(User.findOne({ groupmeId: req.body.user_id }));

    let movie;
    [err, movie] = await to(Movie.findOne({ title_lower: cleanTitle }));

    if (!movie) {
      let err, foundMovie;
      [err, foundMovie] = await to(_fuzzySearchMovies(text));

      if (foundMovie) {
        movie = foundMovie;
      } else {
        return false;
      }
    }

    if (
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

module.exports = {
  createApi,
  sendBotMessage,
  receiveMessage,
  getUsersInGroup,
  getUser,
  getSingleUserGroups
};