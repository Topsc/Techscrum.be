export {};
const { param, body } = require('express-validator');

const store = [
  body('name').notEmpty().isString(),
  body('slug').notEmpty().isString(),
];

const update = [param('id').notEmpty().isString()];

const remove = [param('id').notEmpty().isString()];

const eliminate = [param('taskId').notEmpty().isString(), param('labelId').notEmpty().isString()];

module.exports = {
  store,
  update,
  remove,
  eliminate,
};
