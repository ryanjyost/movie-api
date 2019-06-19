const { create } = require("apisauce");
const queryString = require("query-string");
const uuidv1 = require("uuid/v1");

const createApi = (token = process.env.GROUPME_ACCESS_TOKEN) => {
  const api = create({
    baseURL: "https://api.groupme.com/v3",
    timeout: 30000,
    headers: {
      "X-Custom-Header": "foobar",
      "Content-Type": "application/json",
      Host: "api.groupme.com",
      "X-Access-Token": token
    }
  });

  const createGroup = () =>
    api.post("/groups", {
      name:
        process.env.ENV === "development"
          ? "MM Development"
          : process.env.ENV === "staging"
            ? "MM Staging"
            : "Movie Medium",
      share: true,
      image_url:
        "https://i.groupme.com/1200x1200.png.aae8cb764cd447f2b60bd670e8e6ac67"
    });

  const sendBotMessage = (text, bot_id) =>
    api.post("/bots/post", {
      text,
      bot_id: bot_id
    });

  const sendMessageToGroup = (group_id, text, user_ids = []) => {
    let attachments = [];

    if (user_ids.length) {
      attachments.push({
        type: "mentions",
        user_ids
      });
    }
    return api.post(`/groups/${group_id}/messages`, {
      message: {
        text: text,
        source_guid: uuidv1(),
        attachments
      }
    });
  };

  const getCurrentUser = () => api.get("/users/me");

  const getCurrentUsersGroups = (
    params = {
      omit: "memberships",
      per_page: 100
    }
  ) => {
    let paramsString = queryString.stringify(params);
    return api.get("/groups", paramsString);
  };

  const getGroup = groupMeId => api.get(`groups/${groupMeId}`);

  const likeMessage = (groupId, messageId) =>
    api.post(`/messages/${groupId}/${messageId}/like`);

  const addMemberToGroup = (groupId, postData) =>
    api.post(`/groups/${groupId}/members/add`, postData);

  const createBot = groupMeGroupId =>
    api.post("bots", {
      bot: {
        name:
          process.env.ENV === "development"
            ? "Dev Bot"
            : process.env.ENV === "staging"
              ? "Staging Bot"
              : "Movie Bot",
        group_id: groupMeGroupId,
        avatar_url:
          "https://i.groupme.com/1200x1200.png.aae8cb764cd447f2b60bd670e8e6ac67",
        callback_url:
          process.env.GROUPME_CALLBACK_URL + "/groupme/receive_message"
      }
    });

  return {
    createGroup,
    getCurrentUsersGroups,
    sendBotMessage,
    getCurrentUser,
    getGroup,
    likeMessage,
    addMemberToGroup,
    createBot,
    sendMessageToGroup
  };
};

module.exports = createApi;
