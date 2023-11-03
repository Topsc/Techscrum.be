const RANDOM_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomStringGenerator = (stringLength: number) => {
  let result = '';
  const characters = RANDOM_CHAR;
  const charactersLength = characters.length;

  for (let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export { randomStringGenerator };
