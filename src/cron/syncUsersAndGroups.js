const { createObjectId, to } = require("../util/index");
const {
  GroupServices,
  PlatformServices,
  UserServices
} = require("../services");
const GroupMeServices = PlatformServices.GroupMe;
const { WebClient } = require("@slack/web-api");

/*
* Loop through every MM group. Fetch the current GroupMe members list of each group, and make sure the user has
* group in <groups> and that the user is in the MM group's <members>
*/

module.exports = async () => {
  try {
    const groups = await GroupServices.findAllGroups();

    for (let group of groups) {
      try {
        if (group.platform === "slack") {
          const SlackApi = new WebClient(group.bot.bot_access_token);
          const channelResponse = await SlackApi.channels.info({
            channel: group.slackId
          });

          if (!channelResponse.ok) {
            continue;
          }

          const { channel } = channelResponse;

          for (let member of group.members) {
            // if the user is not in the channel
            if (channel.members.indexOf(member.slackId) < 0) {
              // user is leaving the one group they are part of, so just delete them
              // if (member.groups.length === 1) {
              //   await UserServices.deleteUser(member._id);
              // } else {
              await GroupServices.removeUserFromGroup(group._id, member._id);
              await UserServices.removeGroupFromUser(member._id, group._id);
              // }
            }
          }
        } else if (group.platform === "groupme") {
          const groupMeData = await GroupMeServices.getGroup(group.groupmeId);
          // if (
          //   groupMeData.data &&
          //   groupMeData.data.meta &&
          //   groupMeData.data.meta.status === 404
          // ) {
          // }

          for (let member of group.members) {
            const memberInActualGroup = groupMeData.members.find(
              m => m.user_id === member.groupmeId
            );
            if (!memberInActualGroup) {
              // user is leaving the one group they are part of, so just delete them
              // if (member.groups.length === 1) {
              //   await UserServices.deleteUser(member._id);
              // } else {
              await GroupServices.removeUserFromGroup(group._id, member._id);
              await UserServices.removeGroupFromUser(member._id, group._id);
              // }
            }
          }
        }
      } catch (e) {
        console.log("Error syncing users and groups", e);
      }
    }
  } catch (e) {
    console.log("Error syncing users and groups", e);
  }
};
