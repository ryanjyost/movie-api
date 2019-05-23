const CronJob = require("cron").CronJob;

// cron job functions
const handleMovieCutoffs = require("./handleMovieCutoffs");
const syncUsersAndGroups = require("./syncUsersAndGroups");
const handleCutoffNotifications = require("./handleCutoffNotifications");
const calcMovieMetrics = require("../calcMovieMetrics");
const { createWinnerMap } = require("../addMovieToSeason");

const job1 = new CronJob("0 1 0 * * *", handleMovieCutoffs, null, true);

const job2 = new CronJob("0 0 12 * * *", handleCutoffNotifications, null, true);

const job3 = new CronJob("0 0 1 * * *", syncUsersAndGroups, null, true);

const runCronJobs = () => {
  job1.start();
  job2.start();
  job3.start();
};

syncUsersAndGroups();
createWinnerMap({ id: 4 });
// handleCutoffNotifications();
// calcMovieMetrics();

module.exports = runCronJobs;
