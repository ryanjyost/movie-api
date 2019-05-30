module.exports = {
  Groups: require("./models/groups"),
  GroupMe: require("./models/platforms/groupme"),
  Lib: require("./services"),
  Movies: require("./models/movies"),
  Platforms: {
    GroupMe: require("./models/platforms/groupme")
  },
  Seasons: require("./models/seasons"),
  Users: require("./models/users")
};
