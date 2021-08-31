module.exports = {
  roundTo2(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  },
  stdDev(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    );
  },
};
