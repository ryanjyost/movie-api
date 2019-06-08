const createApi = require("./api");
const API = createApi();

module.exports = {
  createApi,
  createGroup: API.createGroup,
  getGroup: API.getGroup,
  sendBotMessage: API.sendBotMessage,
  likeMessage: API.likeMessage,
  addMemberToGroup: API.addMemberToGroup,
  createBot: API.createBot,
  sendMessageToGroup: API.sendMessageToGroup
};
