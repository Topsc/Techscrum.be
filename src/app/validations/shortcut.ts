export {};
const { param, body } = require('express-validator');

const store = [
  param('id').notEmpty().isString(),
  body('shortcutLink').notEmpty().isString(),
  body('name').notEmpty().isString(),
];

const update = [
  param('projectId').notEmpty().isString(),
  param('shortcutId').notEmpty().isString(),
  body('shortcutLink').notEmpty().isString(),
  body('name').notEmpty().isString(),
];

const remove = [
  param('projectId').notEmpty().isString(),
  param('shortcutId').notEmpty().isString(),
];

module.exports = {
  store,
  update,
  remove,
};
