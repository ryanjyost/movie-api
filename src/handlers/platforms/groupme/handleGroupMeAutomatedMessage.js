const Emitter = require("../../../EventEmitter");

module.exports = async (groupmeGroupId, text) => {
  if (text.includes("added")) {
    const isMovieMediumInitiated = text
      .split("added")[0]
      .includes("Movie Medium");

    if (!isMovieMediumInitiated) {
      Emitter.emit("userAddedInGroupMe", groupmeGroupId, text);
    }
  }

  return null;
};
