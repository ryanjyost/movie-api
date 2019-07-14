module.exports = rankings => {
  let text = `🏆 OVERALL RANKINGS 🏆` + "\n";

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
    `*percentage is how close your predictions are on average. Low scores are good, high scores are bad.`;

  return text;
};
