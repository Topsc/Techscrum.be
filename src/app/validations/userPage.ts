export {};
const { param } = require('express-validator');

const update = [param('id').notEmpty().isString()];

module.exports = {
  update,
};
