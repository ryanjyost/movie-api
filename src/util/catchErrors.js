const Boom = require("@hapi/boom");

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    if (!err.isBoom) {
      return next(Boom.badImplementation(err));
    }
    next(err);
  });
};

module.exports = asyncMiddleware;
