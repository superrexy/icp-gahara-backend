module.exports = {
  countTotalDay: (startDate, endDate) => {
    const difference = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return totalDays;
  },
};
