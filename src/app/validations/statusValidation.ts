import { param } from 'express-validator';

export const index = [param('boardId').notEmpty().isString()];
