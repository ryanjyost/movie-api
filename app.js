const express = require("express");
const path = require("path");
const morgan = require("morgan");
const winston = require("./config/winston.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const PrettyError = require("pretty-error");
const pe = new PrettyError();

require("dotenv").config();

const db = require("./db");
const runCronJobs = require("./src/services/cron");

require("./src/listeners");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(morgan("combined", { stream: winston.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", require("./src/routes"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // Log error message
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  console.log(pe.render(err));
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: err.message });
});

/* RUN CRON JOBS */
// runCronJobs();

module.exports = app;
