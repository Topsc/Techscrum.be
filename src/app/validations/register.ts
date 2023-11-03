export {};
const { param, body } = require('express-validator');

const register = [
  param('email').isEmail(),
];

const store = [
  body('email').notEmpty(),
  body('name').notEmpty(),
  body('password').notEmpty(),
];

module.exports = {
  register,
  store,
};
