export {};
const { param } = require('express-validator');

const show = [
  param('id').isString(),
];

module.exports = {
  show,
};
