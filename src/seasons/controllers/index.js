const getSeasons = require("../services/getSeasons");

exports.getSeasons = async (req, res, next) => {
  try {
    const seasons = await getSeasons();
    res.json({ seasons });
  } catch (e) {
    next(e);
  }
};
