const { Groups, GroupMe } = require("../../src");

module.exports = async (req, res) => {
  const groups = await Groups.getGroups();

  for (let group of groups) {
    await GroupMe.sendBotMessage(req.body.message, group.bot.bot_id);
  }

  res.json({ message: req.body.message, groups: groups });
};
