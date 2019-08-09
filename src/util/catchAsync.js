const Boom = require("@hapi/boom");

const handleApi = promise => {
  return promise
    .then(response => {
      if (!response) {
        return null;
      }

      console.log("RESPONSE!", response);

      if ("ok" in response) {
        return response.ok
          ? response.data
            ? response.data.response
            : [response, null]
          : [response, null];
      } else {
        return [null, response];
      }
    })
    .catch(err => {
      return [err, null];
    });
};

module.exports = handleApi;
