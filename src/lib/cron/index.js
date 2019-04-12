const CronJob = require("cron").CronJob;

// cron job functions
const handleMovieCutoffs = require("./handleMovieCutoffs");
const syncUsersAndGroups = require("./syncUsersAndGroups");
const handleDayBeforeCutoffNotifications = require("./handleDayBeforeCutoffNotifications");
const calcMovieMetrics = require("../calcMovieMetrics");

const job1 = new CronJob(
  "0 1 0 * * *",
  handleMovieCutoffs,
  null,
  true,
  "America/Chicago"
);

const job2 = new CronJob(
  "0 0 8 * * *",
  handleDayBeforeCutoffNotifications,
  null,
  true,
  "America/Chicago"
);

const job3 = new CronJob(
  "0 0 1 * * *",
  syncUsersAndGroups,
  null,
  true,
  "America/Chicago"
);

const runCronJobs = () => {
  job1.start();
  job2.start();
};

syncUsersAndGroups();
calcMovieMetrics();
// handleDayBeforeCutoffNotifications();

module.exports = runCronJobs;
