//TODO: typo error file name
const TrialDate = (timestamp: number) => {

  const startDate = new Date(timestamp * 1000);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const formattedDate = `${startYear}-${startMonth}-${startDay}`;

  return formattedDate;
};

export { TrialDate };
