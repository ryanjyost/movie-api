const mongoose = require("mongoose");
const URL = process.env.MONGODB_URL;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// const URL =
//   "mongodb://skoosh:skoosh2002@ds127362.mlab.com:27362/newsbie-sandbox";

mongoose.connect(
  URL,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
