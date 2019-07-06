module.exports = place => {
  const pointsByPlace = [0, 25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  if (pointsByPlace[place]) {
    return pointsByPlace[place];
  }

  return 0;
};
