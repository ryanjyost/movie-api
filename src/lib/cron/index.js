const CronJob = require("cron").CronJob;

// cron job functions
const handleMovieCutoffs = require("./handleMovieCutoffs");
const syncUsersAndGroups = require("./syncUsersAndGroups");
const handleDayBeforeCutoffNotifications = require("./handleDayBeforeCutoffNotifications");

const job1 = new CronJob(
  "0 01 0 * * *",
  handleMovieCutoffs,
  null,
  true,
  "America/New_York"
);

const job2 = new CronJob(
  "0 0 08 * * *",
  handleDayBeforeCutoffNotifications,
  null,
  true,
  "America/New_York"
);

const job3 = new CronJob(
  "0 0 7 * * *",
  syncUsersAndGroups,
  null,
  true,
  "America/New_York"
);

const runCronJobs = () => {
  job1.start();
  job2.start();
};

syncUsersAndGroups();
//handleMovieCutoffs();

module.exports = runCronJobs;
