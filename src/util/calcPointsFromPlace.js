module.exports = place => {
  if (place === 1) {
    return 30;
  } else if (place === 2) {
    return 20;
  } else if (place === 3) {
    return 10;
  }

  return 0;
};
