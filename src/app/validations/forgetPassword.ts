export {};
const { body } = require('express-validator');

const forgetPasswordApplication = [body('email').notEmpty().isEmail()];

const updateUserPassword = [body('password').notEmpty().isString()];

module.exports = {
  forgetPasswordApplication,
  updateUserPassword,
};
