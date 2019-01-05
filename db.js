const mongoose = require("mongoose");
const URL = "mongodb://skoosh:skoosh2002@ds147354.mlab.com:47354/movies";

// const URL =
//   "mongodb://skoosh:skoosh2002@ds127362.mlab.com:27362/newsbie-sandbox";

mongoose.connect(
  URL,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
