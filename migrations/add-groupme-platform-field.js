const Group = require("../src/models/groups/model");
console.log("test");

async function migrate() {
  await Group.updateMany(
    { platform: { $exists: false } },
    {
      $set: {
        platform: "groupme"
      }
    },
    {
      upsert: false,
      multi: true
    }
  );
}

module.exports = migrate;
