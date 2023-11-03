import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getBoardTasks } from '../../services/boardService';
import { replaceId } from '../../services/replaceService';
import { asyncHandler } from '../../utils/helper';
import escapeStringRegexp from 'escape-string-regexp';
import status from 'http-status';

// GET one
exports.show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const boardId = req.params.id;
  const { inputFilter, userFilter, taskTypeFilter, labelFilter } = req.params;

  if (boardId === 'undefined' || boardId === 'null') {
    res.status(status.NOT_ACCEPTABLE).send({});
    return;
  }

  let input = {};
  let users = {};
  let taskTypes = {};
  let labels = {};

  enum Cases {
    searchAll = 'all',
  }

  if (inputFilter !== Cases.searchAll) {
    const escapeRegex = escapeStringRegexp(inputFilter.toString());
    const regex = new RegExp(escapeRegex, 'i');
    input = { title: regex };
  }

  if (userFilter !== Cases.searchAll) {
    const userIds = userFilter.split('-');
    users = { assignId: { $in: userIds } };
  }

  if (taskTypeFilter !== Cases.searchAll) {
    const taskTypeIds = taskTypeFilter.split('-');
    taskTypes = { typeId: { $in: taskTypeIds } };
  }

  if (labelFilter !== Cases.searchAll) {
    const labelIds = labelFilter.split('-');
    labels = { tags: { $all: labelIds } };
  }

  let boardTasks = await getBoardTasks(
    boardId,
    input,
    users,
    taskTypes,
    labels,
    req.dbConnection,
    req.tenantsConnection,
  );

  const result = replaceId(boardTasks);

  res.status(status.OK).json(result[0]);
});
