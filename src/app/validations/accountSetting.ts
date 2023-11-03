export {};
const { body } = require('express-validator');

const updatePassword = [
  body('newPassword').notEmpty().isString(),
  body('oldPassword').notEmpty().isString(),
];

const update = [body('name').notEmpty().isString()];

const remove = [body('password').notEmpty().isString()];

module.exports = {
  updatePassword,
  update,
  remove,
};
