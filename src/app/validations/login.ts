export {};
const { body } = require('express-validator');

const login = [
  // username must be an email
  body('email').isEmail(),
];
module.exports = {
  login,
};