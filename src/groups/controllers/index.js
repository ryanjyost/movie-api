const Group = require("../model");
const { to } = require("../../helpers");

// servces
const getGroup = require("../services/getGroup.js");

exports.getGroup = async (req, res, next) => {
  console.log("GET GROUP", req.body);
  res.json({ group: "HEY" });
};
