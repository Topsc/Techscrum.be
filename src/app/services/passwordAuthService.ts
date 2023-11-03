export const passwordAuth = async (passwordPlaintext: string, passwordCiphertext: string) => {
  const bcrypt = require('bcrypt');
  const encryptedPassword = await bcrypt.compare(passwordPlaintext, passwordCiphertext);
  return encryptedPassword;
};
