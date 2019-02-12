const { create } = require("apisauce");
const queryString = require("query-string");

const createApi = token => {
  const api = create({
    baseURL: "https://api.groupme.com/v3",
    timeout: 10000,
    headers: {
      "X-Custom-Header": "foobar",
      "Content-Type": "application/json",
      Host: "api.groupme.com",
      "X-Access-Token": token
    }
  });

  const sendBotMessage = (text, groupId) =>
    api.post("/bots/post", {
      text,
      bot_id: process.env.GROUPME_BOT_ID
    });

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

  return {
    getCurrentUsersGroups,
    sendBotMessage,
    getCurrentUser,
    getGroup,
    likeMessage
  };
};

module.exports = createApi;
