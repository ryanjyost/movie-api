const GroupMe = require("../src/platforms/groupme");

const sendMovieScoreResultsToAllGroups = async (movie, score) => {
  let mainMessage = `🍿 "${
    movie.title
  }" has a Rotten Tomatoes Score of ${score}% `;
  let scoreMessage = ``;

  let votes = [];
  for (let user in movie.votes) {
    let err, userInfo;
    [err, userInfo] = await to(User.findOne({ _id: user }));
    if (userInfo && userInfo.name !== "Movie Medium") {
      votes.push({
        name: userInfo.nickname || userInfo.name,
        vote: userInfo.votes[movie._id],
        diff: userInfo.votes[movie._id] - score
      });
    }
  }

  let sorted = votes.sort((a, b) => {
    if (Math.abs(a.diff) > Math.abs(b.diff)) {
      return 1;
    } else if (Math.abs(b.diff) > Math.abs(a.diff)) {
      return -1;
    } else {
      return 0;
    }
  });

  for (let i = 0; i < sorted.length; i++) {
    let vote = sorted[i];
    scoreMessage =
      scoreMessage +
      `${i + 1}) ${vote.name}: ${vote.diff >= 0 ? "+" : "-"}${Math.abs(
        vote.diff
      )}% (${vote.vote}% vs. ${score}%)` +
      "\n";
  }

  await GroupMe.sendBotMessage(mainMessage);
  await GroupMe.sendBotMessage(scoreMessage);
};

module.exports = sendMovieScoreResultsToAllGroups;
