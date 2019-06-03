const { GroupServices, PlatformServices } = require("../../services");
const { sortArrayByProperty } = require("../../util");

const GroupMeServices = PlatformServices.GroupMe;

module.exports = async movie => {
  const groups = await GroupServices.findAllGroups();

  for (let group of groups) {
    let movieMessage = `🔒 "${movie.title}" predictions are locked in!` + "\n";

    let sortedMembers = sortArrayByProperty(
      group.members,
      `votes.${movie._id}`,
      false
    );

    let voteMessage = ``;
    for (let user of sortedMembers) {
      if (user.isMM) continue;

      if (user) {
        voteMessage =
          voteMessage +
          `${user.name}: ${
            user.votes[movie._id] < 0
              ? `Forgot to predict 😬`
              : `${user.votes[movie._id]}%`
          }` +
          "\n";
      }
    }

    await GroupMeServices.sendBotMessage(
      movieMessage + "\n" + voteMessage,
      group.bot.bot_id
    );
  }
};
