// cron job functions
const handleMovieCutoffs = require("./handleMovieCutoffs");
const syncUsersAndGroups = require("./syncUsersAndGroups");
const handleDayBeforeCutoffNotifications = require("./handleDayBeforeCutoffNotifications");

exports.handleMovieCutoffs = handleMovieCutoffs;

exports.handleDayBeforeCutoffNotifications = handleDayBeforeCutoffNotifications;

exports.syncUsersAndGroups = syncUsersAndGroups;
