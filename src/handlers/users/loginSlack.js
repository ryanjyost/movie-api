const {
  GroupServices,
  PlatformServices,
  UserServices
} = require("../../services");
const { Slack } = require("../../platforms");
const { WebClient } = require("@slack/web-api");
const Emitter = require("../../EventEmitter");
const { createApi, createChannel } = require("../platforms/slack");

module.exports = async code => {
  // get auth token
  const SlackAPI = Slack.createApi();
  const response = await SlackAPI.authenticate(code);
  const { access_token, bot, user_id } = response.data;

  const userClient = new WebClient(access_token);
  const currentUserInfo = await userClient.users.info({ user: user_id });

  let user = await UserServices.findOrCreateSlackUser(currentUserInfo.user);

  let userMongoObject = null,
    userMMGroups = [],
    groupsForResponse = [];

  let madeNewGroup = false;
  if (!user.isNew) {
    let userMongoObject = await UserServices.findUserById(user._id);
    let userMMGroups = [...userMongoObject.groups];

    const userConvos = await userClient.users.conversations();
    console.log("CONVOS", userConvos);

    for (let channel of userConvos.channels) {
      const existingGroup = await GroupServices.findGroupBySlackId(channel.id);

      if (existingGroup) {
        await GroupServices.addUserToGroup(
          {
            slackId: channel.id
          },
          userMongoObject._id
        );
        userMMGroups.push(existingGroup._id);
        groupsForResponse.push(existingGroup);
      }

      // if user isn't part of an existing group, create a new one
      if (!userMMGroups.length) {
        const UserSlackApi = await createApi(access_token);
        const channel = await UserSlackApi.createChannel();

        let newSlackGroup = await GroupServices.createSlackGroup({
          ...channel.data.channel,
          ...{ bot, members: [userMongoObject._id] }
        });

        userMMGroups = [newSlackGroup._id];
        madeNewGroup = true;
      }

      userMongoObject.groups = userMMGroups;
      await userMongoObject.save();
    }
  }

  if (user.isNew) {
    const finalNewUserData = await UserServices.findUserById(user._id);
    return { ...finalNewUserData.toObject(), ...{ isNew: true, madeNewGroup } };
  } else {
    return user;
  }
};
