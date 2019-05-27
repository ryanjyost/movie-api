const express = require("express");
const path = require("path");
const morgan = require("morgan");
const winston = require("./config/winston.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const db = require("./db");
const runCronJobs = require("./src/lib/cron");

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
  console.error("ERROR HANDLER", err.data || err.message || err);
  console.error("ERROR HANDLER", err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: err.message });
});

/* RUN CRON JOBS */
runCronJobs();

module.exports = app;
