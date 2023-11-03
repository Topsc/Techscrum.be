export {};
const { check } = require('express-validator');

const store = [
  // username must be an email
  check('domain', 'Domain Empty').notEmpty(),
  check('name', 'Name Empty').notEmpty(),
];

const index = [
  // username must be an email
  check('domain', 'Domain Empty').notEmpty(),
];

module.exports = {
  store,
  index,
};
