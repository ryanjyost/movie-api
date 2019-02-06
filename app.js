const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const CronJob = require("cron").CronJob;
require("dotenv").config();
const db = require("./db");

const handleMovieCutoffs = new CronJob(
  "0 05 0 * * *",
  require("./lib/cron").handleMovieCutoffs,
  null,
  true,
  "America/New_York"
);
//handleMovieCutoffs.start();

const handleDayBeforeCutoffNotifications = new CronJob(
  "0 0 0 * * *",
  require("./lib/cron").handleDayBeforeCutoffNotifications,
  null,
  true,
  "America/New_York"
);
//handleDayBeforeCutoffNotifications.start();

//require("./controllers/GroupController").create(46925214);
// require("./lib/updateMovieScoreMap")(null);
//require("./lib/syncUsersAndGroups")(null);

const index = require("./routes/index");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
