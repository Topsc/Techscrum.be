import { IProgress } from '../../types';

const removeDuplicateTimestamps = (progresses: IProgress[]) => {
  return progresses.filter((progress: IProgress, index) => {
    return progresses.findIndex((p) => p.timeStamp === progress.timeStamp) === index;
  });
};

const convertTimestampToDate = (progresses: IProgress[]) => {
  return progresses.map((progress: IProgress) => {
    return {
      ...progress,
      timeStamp: new Date(progress.timeStamp).toLocaleDateString(),
    };
  });
};

const removeDuplicateDate = (progresses: { timeStamp: string; _id: string; value: number }[]) => {
  return progresses.filter((progress: { timeStamp: string; _id: string; value: number }, index) => {
    return progresses.findIndex((p) => p.timeStamp === progress.timeStamp) === index;
  });
};

module.exports = {
  removeDuplicateTimestamps,
  convertTimestampToDate,
  removeDuplicateDate,
};
