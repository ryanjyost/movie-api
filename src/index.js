module.exports = {
  Groups: require("./models/groups"),
  GroupMe: require("./platforms/groupme"),
  Lib: require("./services"),
  Movies: require("./models/movies"),
  Platforms: {
    GroupMe: require("./platforms/groupme")
  },
  Seasons: require("./models/seasons"),
  Users: require("./models/users")
};
