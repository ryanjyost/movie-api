const { to } = require("../../../helpers");
const GroupMe = require("../../platforms/groupme");

// User services
const login = require("../services/login");

exports.login = async (req, res, next) => {
  let token = req.body.access_token;
};
