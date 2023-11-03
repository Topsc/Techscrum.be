export {};
const { param, body } = require('express-validator');

const update = [
  param('userId').notEmpty().isString(),
  param('projectId').notEmpty().isString(),
  body('roleId').notEmpty().isString(),
];

const remove = [param('userId').notEmpty().isString(), param('projectId').notEmpty().isString()];

const invite = [
  param('projectId').notEmpty().isString(),
  body('roleId', 'roleId required').notEmpty().isString(),
  body('email').notEmpty().isString(),
];

module.exports = {
  update,
  remove,
  invite,
};
