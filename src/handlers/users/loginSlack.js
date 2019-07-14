const {
  GroupServices,
  PlatformServices,
  UserServices
} = require("../../services");
const { Slack } = require("../../platforms");
const { WebClient } = require("@slack/web-api");
const Emitter = require("../../EventEmitter");
const createChannel = require("../platforms/slack/createChannel");

module.exports = async code => {
  // get auth token
  const SlackAPI = Slack.createApi();
  const response = await SlackAPI.authenticate(code);
  const { access_token, bot, user_id } = response.data;

  const userClient = new WebClient(access_token);
  const currentUserInfo = await userClient.users.info({ user: user_id });

  let newMMUser = await UserServices.findOrCreateSlackUser(
    currentUserInfo.user
  );

  if (!newMMUser) return null;

  if (!newMMUser.groups.length) {
    const userConvos = await userClient.users.conversations();
    console.log("CONVOS", userConvos);
    CHECK THAT CHANNEL ID MATCHEX CURRENT
    // const { group, user } = await createChannel(access_token);
  }

  // const channel = await userClient.channels.create({ name: "moviemedium" });
  console.log("WORKING", newMMUser);

  // console.log("RESPONSE", response.data);
};
