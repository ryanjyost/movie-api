const { Groups, Users } = require("../../models");

/*
* Create an MM group from GroupMe group
*/
module.exports = async channelData => {
  // start building new group
  let newGroup = {
    name: channelData.name,
    slackId: channelData.id,
    slack: { ...channelData },
    bot: channelData.bot,
    platform: "slack",
    members: channelData.members
  };

  // actually create the MM group
  return await Groups.createGroup(newGroup);
};
