const createApi = require("./services/GroupMeApi");
const API = createApi(process.env.GROUPME_ACCESS_TOKEN);

exports.createApi = createApi;
exports.sendBotMessage = API.sendBotMessage;
exports.getCurrentUser = API.getCurrentUser;
exports.getGroup = API.getGroup;
