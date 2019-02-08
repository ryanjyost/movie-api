const { create } = require("apisauce");

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

  return {
    sendBotMessage
  };
};

module.exports = createApi;
