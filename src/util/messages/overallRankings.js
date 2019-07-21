module.exports = (rankings, platform) => {
  let isSlack = platform === "slack";
  let text = isSlack ? `*🏆 Overall Rankings 🏆*` : `🏆 OVERALL RANKINGS 🏆`;
  text = text + "\n";

  for (let i = 0; i < rankings.length; i++) {
    if (!rankings[i].moviesInCalc) {
      text =
        text +
        `${i + 1}) ${rankings[i].name}: No prediction history (yet)` +
        "\n";
    } else {
      text =
        text +
        `${i + 1}) ${rankings[i].name}: ${rankings[i].avgDiff.toFixed(1)}%` +
        "\n";
    }
  }

  text =
    text +
    (isSlack
      ? `_percentage is how close your predictions are on average. Low scores are good, high scores are bad_`
      : `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`);

  return text;
};
