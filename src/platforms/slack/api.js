const { create } = require("apisauce");
const queryString = require("query-string");

const createApi = accessToken => {
  const api = create({
    baseURL: "https://slack.com/api",
    timeout: 30000,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: accessToken ? `Bearer ${accessToken}` : null
    }
  });

  const authenticate = code =>
    api.post(
      "/oauth.access",
      queryString.stringify({
        code,
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET
      })
    );

  const createChannel = () =>
    api.post(
      "/channels.create",
      queryString.stringify({ name: "moviemedium" })
    );

  return {
    authenticate,
    createChannel
  };
};

module.exports = createApi;
