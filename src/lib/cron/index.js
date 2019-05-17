const CronJob = require("cron").CronJob;

// cron job functions
const handleMovieCutoffs = require("./handleMovieCutoffs");
const syncUsersAndGroups = require("./syncUsersAndGroups");
const handleDayBeforeCutoffNotifications = require("./handleDayBeforeCutoffNotifications");
const calcMovieMetrics = require("../calcMovieMetrics");

const job1 = new CronJob("0 1 0 * * *", handleMovieCutoffs, null, true);

const job2 = new CronJob(
  "0 0 8 * * *",
  handleDayBeforeCutoffNotifications,
  null,
  true
);

const job3 = new CronJob("0 0 1 * * *", syncUsersAndGroups, null, true);

const runCronJobs = () => {
  job1.start();
  job2.start();
  job3.start();
};

syncUsersAndGroups();
handleDayBeforeCutoffNotifications();
// calcMovieMetrics();

module.exports = runCronJobs;
