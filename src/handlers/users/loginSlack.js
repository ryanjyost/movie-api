const {
  GroupServices,
  PlatformServices,
  UserServices
} = require("../../services");
const { Slack } = require("../../platforms");
const { WebClient } = require("@slack/web-api");
const Emitter = require("../../EventEmitter");
const { createApi, createChannel } = require("../../platforms/slack");
const { to } = require("../../util");
const Boom = require("@hapi/boom");

module.exports = async code => {
  console.log("CODE", code);
  try {
    // get auth token
    const SlackAPI = Slack.createApi();
    const response = await SlackAPI.authenticate(code);

    const { data } = response;
    console.log("DATA", data);
    if (!data.ok) {
      return { error: "Something went wrong" };
    }

    // check if just existing user logging in
    let user = await UserServices.findUserBySlackId(
      data.user ? data.user.id : data.user_id
    );
    if (user && user.groups.length) {
      console.log("USER", user);
      return user;
    } else if (user && !user.groups.length) {
      await UserServices.deleteUser(user._id);
      user = null;
    }

    // Did a non-existent user click the sign-in button? Limited in what we can handle here
    if (!data.bot) {
      console.log("NO USER SIGN IN ATTEMPT", data);
      const existingGroup = await GroupServices.findGroupBySlackTeamId(
        data.team.id
      );
      console.log("EXISTING", existingGroup);

      if (existingGroup.length) {
        let group = existingGroup[0];
        let userClient = new WebClient(group.bot.bot_access_token);

        const currentUserInfo = await userClient.users.info({
          user: data.user ? data.user.id : data.user_id
        });

        user = await UserServices.findOrCreateSlackUser(currentUserInfo.user);
        let userMongoObject = null,
          userMMGroups = [];
        if (user) {
          userMongoObject = await UserServices.findUserById(user._id);
          userMMGroups = [...userMongoObject.groups];
        }

        await GroupServices.addUserToGroup(
          {
            slackId: group.slackId
          },
          user._id
        );
        userMMGroups.push(existingGroup[0]._id);
        userMongoObject.groups = userMMGroups;
        await userMongoObject.save();

        const finalNewUserData = await UserServices.findUserById(user._id);

        return {
          ...(finalNewUserData ? finalNewUserData.toObject() : user),
          ...{ isNew: true }
        };
      } else {
        return { error: "Need to sign up" };
      }
      return;
    }

    // Ok, do full sign up
    let userClient = new WebClient(data.bot.bot_access_token);
    if (!user) {
      const currentUserInfo = await userClient.users.info({
        user: data.user ? data.user.id : data.user_id
      });

      user = await UserServices.findOrCreateSlackUser(currentUserInfo.user);
    }

    let userMongoObject = null,
      userMMGroups = [];

    let madeNewGroup = false;
    if (user) {
      userMongoObject = await UserServices.findUserById(user._id);
      userMMGroups = [...userMongoObject.groups];
    }

    // check if the new user is in a slack MM group
    if (user.isNew) {
      console.log("SEE IF IN EXISTINg", user.slack.team_id);
      const existingGroup = await GroupServices.findGroupBySlackTeamId(
        user.slack.team_id
      );
      console.log("EXISTING", existingGroup);

      if (existingGroup.length) {
        await GroupServices.addUserToGroup(
          {
            slackId: existingGroup[0].slackId
          },
          userMongoObject._id
        );
        userMMGroups.push(existingGroup[0]._id);
        userMongoObject.groups = userMMGroups;
        await userMongoObject.save();
      }

      // UserServices.deleteUser(user._id);

      // for (let channel of userConvos.channels) {
      //   const existingGroup = await GroupServices.findGroupBySlackId(
      //     channel.id
      //   );
      //
      //   if (existingGroup) {
      //     await GroupServices.addUserToGroup(
      //       {
      //         slackId: channel.id
      //       },
      //       userMongoObject._id
      //     );
      //     userMMGroups.push(existingGroup._id);
      //     groupsForResponse.push(existingGroup);
      //   }
      // }
      //
      // userMongoObject.groups = userMMGroups;
      // await userMongoObject.save();
    }

    // if user isn't part of an existing group, create a new one
    if (user.isNew || !userMMGroups.length) {
      const UserSlackApi = await createApi(data.access_token);
      let channel = await UserSlackApi.createChannel({ validate: true });
      if (!channel.data.ok) {
        console.log("ERROR with channel creation", channel);
        const channels = await userClient.channels.list({ limit: 0 });
        console.log("ALL CHANNELS", channels);

        let existingChannel = channels.channels.find(item => {
          return (
            item.name ===
            (process.env.ENV === "development"
              ? "mmdev"
              : process.env.ENV === "staging"
                ? "mmstaging"
                : "moviemedium")
          );
        });

        if (existingChannel) {
          channel = await userClient.channels.info({
            channel: existingChannel.id
          });

          console.log("EXISTINg CHANNEL", channel);
        }

        if (!channel) {
          // remove user to avoid weirdness
          await UserServices.deleteUser(user._id);
          return channel.data;
        }
      }

      let newSlackGroup = await GroupServices.createSlackGroup({
        ...(channel.channel ? channel.channel : channel.data.channel),
        ...{ bot: data.bot, members: [user._id], team_id: user.slack.team_id }
      });

      Emitter.emit("createdSlackGroup", newSlackGroup);

      userMMGroups = [newSlackGroup._id];
      userMongoObject.groups = userMMGroups;
      await userMongoObject.save();
      madeNewGroup = true;
    }

    if (user.isNew) {
      const finalNewUserData = await UserServices.findUserById(user._id);

      return {
        ...(finalNewUserData ? finalNewUserData.toObject() : user),
        ...{ isNew: true, madeNewGroup }
      };
    } else {
      return user;
    }
  } catch (e) {
    console.log("ERROr", e);
    return e.data;
  }
};
