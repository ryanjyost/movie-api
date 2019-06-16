const { GroupMe } = require("../../../index");

module.exports = async (req, res) => {
  const GroupMeApi = GroupMe.createApi();

  const response = await GroupMeApi.getCurrentUser();

  res.json({ user: response.data.response });
};
