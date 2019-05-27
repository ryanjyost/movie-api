const { createObjectId } = require("../../../helpers/index");
const Users = require("../../users");
const Groups = require("../../groups");
const GroupMe = require("../../platforms/groupme");
const _ = require("lodash");

/*
* Loop through every MM group. Fetch the current GroupMe members list of each group, and make sure the user has
* group in <groups> and that the user is in the MM group's <members>
*/

module.exports = async () => {
  try {
    const groups = await Groups.getGroups({}, "members");

    for (let group of groups) {
      let updatedGroupMemberIds = [];

      const groupMeData = await GroupMe.getGroup(group.groupmeId);

      for (let member of groupMeData.members) {
        const user = await Users.getUser({ groupmeId: member.user_id });

        if (user) {
          // nothing there now so just set
          if (!("groups" in user) || !user.groups) {
            user.groups = [group._id];
          } else {
            // strings to easily compare and remove dups
            let groupStrings = [...user.groups].map(group => group.toString());
            // get rid of any duplicates
            const noDupsOfGroupStrings = _.uniq(groupStrings);

            // init var out of if block
            let finalGroupStrings = [...noDupsOfGroupStrings];

            // add group if new
            if (noDupsOfGroupStrings.indexOf(group._id.toString()) < 0) {
              finalGroupStrings = [
                ...noDupsOfGroupStrings,
                ...[group._id.toString()]
              ];
            }

            // convert back and add to user document
            user.groups = finalGroupStrings.map(string =>
              createObjectId(string)
            );
          }

          await user.save();
          updatedGroupMemberIds.push(user._id);
        } else {
          const newUser = await Users.findOrCreateUser(member, group._id);

          updatedGroupMemberIds.push(newUser._id);
        }
      }

      group.members = updatedGroupMemberIds;
      await group.save();
    }
  } catch (e) {
    console.log("Error syncing users and groups", e);
  }
};
