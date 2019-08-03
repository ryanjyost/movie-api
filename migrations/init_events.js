const User = require("../src/models/users/model");

async function migrate() {
  await User.updateMany(
    {},
    {
      $set: {
        events: { created: true }
      }
    },
    {
      upsert: false,
      multi: true
    }
  );
}

module.exports = migrate;
