const replaceAll = (source: string, targetString: string, shiftString: string) => {
  let targetStringExistFlag = source.includes(targetString);
  while (targetStringExistFlag) {
    source = source.replace(targetString, shiftString);
    targetStringExistFlag = source.includes(targetString);
  }
  return source.replace(/\"Id\"/g, '"id"');
};

export const replaceId = (input: any) => {
  const inputString = replaceAll(JSON.stringify(input), '_id', 'Id');
  return JSON.parse(inputString);
};
