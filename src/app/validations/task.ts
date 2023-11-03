export {};
const { param, body } = require('express-validator');

const show = [param('id').notEmpty()];

const store = [body(['boardId', 'title', 'typeId']).notEmpty()];

const update = [
  param('id').notEmpty().isString(),
  body('title').if(body('title').exists()).isString().isLength({ min: 1 }),
  body('priority').if(body('priority').exists()).isString(),
];

const remove = [param('id').notEmpty().isString()];

module.exports = {
  show,
  store,
  update,
  remove,
};
