const jwt = require('jsonwebtoken');

export function tokenGenerate(input: string) {
  const encryptObj = { input };
  const token = jwt.sign(encryptObj, process.env.ACCESS_SECRET, {
    expiresIn: process.env.EXPERT_TIME ?? '24h',
  });

  return token;
}

module.exports = tokenGenerate;
