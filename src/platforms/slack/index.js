const createApi = require("./api");
const API = createApi();

module.exports = {
  createApi,
  createChannel: API.createChannel
};
