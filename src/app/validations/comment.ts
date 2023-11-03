export {};
const { param, body } = require('express-validator');

const store = [
  body('taskId').notEmpty().isString(),
  body('senderId').notEmpty().isString(),
  body('content').notEmpty().isString(),
];

const update = [param('id').notEmpty().isString(), body('content').notEmpty().isString()];

const remove = [param('id').notEmpty().isString()];

module.exports = {
  store,
  update,
  remove,
};
