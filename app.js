const express = require("express");
const path = require("path");
const morgan = require("morgan");
const winston = require("./config/winston.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const CronJob = require("cron").CronJob;
require("dotenv").config();
const db = require("./db");
const {
  handleMovieCutoffs,
  handleDayBeforeCutoffNotifications,
  syncUsersAndGroups
} = require("./src/lib/cron");

const job1 = new CronJob(
  "10 0 * * *",
  handleMovieCutoffs,
  null,
  true,
  "America/New_York"
);
job1.start();

const job2 = new CronJob(
  "0 7 * * *",
  handleDayBeforeCutoffNotifications,
  null,
  true,
  "America/New_York"
);
job2.start();

const job3 = new CronJob(
  "0 5 * * *",
  syncUsersAndGroups,
  null,
  true,
  "America/New_York"
);
job3.start();

// require("./src/groups").createGroup(1234);
// require("./lib/updateMovieScoreMap")(null);
// require("./src/lib/syncUsersAndGroups")(null);

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(morgan("combined", { stream: winston.stream }));
app.use(morgan("combined", { stream: winston.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", require("./routes/index"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // Log error message
  console.error("ERROR HANDLER", err.message);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
