const axios = require("axios");

module.exports = async (responseUrl, payload) => {
  await axios.post(responseUrl, payload);
};
