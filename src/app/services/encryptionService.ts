export const encryption = async (plainText: string) => {
  const bcrypt = require('bcrypt');
  const salt = bcrypt.genSaltSync(10);

  const hashPassword = await bcrypt.hash(plainText, salt);
  return hashPassword;
};
