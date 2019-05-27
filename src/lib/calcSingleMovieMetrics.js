module.exports = async movie => {
  let average = -1,
    numVotes = 0,
    total = 0,
    high = -1,
    low = -1;
  if (movie.votes && movie.rtScore >= 0) {
    for (let user in movie.votes) {
      if (user.isMM) continue;

      if (movie.votes[user] >= 0) {
        numVotes++;
        const diff = Math.abs(movie.votes[user] - movie.rtScore);
        total = total + diff;

        high = diff > high ? diff : high;
        low = diff < low ? diff : low;
      }
    }
    average = Math.round(total / numVotes);
  } else {
    average = -1;
  }

  low = Math.max(low, 0);
  return { average, high, low };
};
