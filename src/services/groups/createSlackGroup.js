const { Groups, Users } = require("../../models");
const moment = require("moment");

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
    members: channelData.members,
    groupmeId: moment().unix()
  };

  // actually create the MM group
  return await Groups.createGroup(newGroup);
};
