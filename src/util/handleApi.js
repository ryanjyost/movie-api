const Boom = require("@hapi/boom");

const handleApi = promise => {
  return promise
    .then(response => {
      if (!response) {
        return null;
      }

      if ("ok" in response) {
        if (response.ok) {
          return response.data ? response.data.response : null;
        } else {
          throw new Boom.badGateway(response);
        }
      } else {
        return response;
      }
    })
    .catch(err => {
      throw new Boom.badGateway(err);
    });
};

module.exports = handleApi;
