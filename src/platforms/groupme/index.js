const createApi = require("./services/createApi");
const API = createApi(process.env.GROUPME_ACCESS_TOKEN);

exports.sendBotMessage = API.sendBotMessage;
