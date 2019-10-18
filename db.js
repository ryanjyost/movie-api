const mongoose = require("mongoose");
const URL = process.env.MONGODB_URL;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

mongoose.connect(
  URL,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
