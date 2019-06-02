const { messageAllGroups } = require("../util");

module.exports = async movie => {
  return await messageAllGroups([`🎥 ${movie.title}`, `${movie.trailer}`]);
};
