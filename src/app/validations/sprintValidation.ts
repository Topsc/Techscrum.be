import { body } from 'express-validator';

export const store = [
  body(['name', 'projectId', 'boardId']).exists().notEmpty().isString(),
  body('isComplete').if(body('isComplete').exists()).isBoolean(),
  body('description').if(body('description').exists()).isString(),
];
