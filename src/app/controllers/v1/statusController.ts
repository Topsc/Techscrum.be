import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/helper';
import * as Status from '../../model/status';
import { replaceId } from '../../services/replaceService';

// GET all
export const index = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  const { boardId } = req.params;

  const statuses = await Status.getModel(req.dbConnection).find(
    { board: boardId },
    { taskList: 0, createdAt: 0, updatedAt: 0 },
    { sort: { order: 1 } },
  );

  return res.status(httpStatus.OK).json(replaceId(statuses));
});
