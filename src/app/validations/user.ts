export {};
const { param } = require('express-validator');

const show = [param('id').notEmpty().isString()];

module.exports = {
  show,
};
